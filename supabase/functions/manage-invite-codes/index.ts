import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header and verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'generate': {
        const { count = 1, type = 'single_use', max_uses = 1, campaign, expires_at, prefix = 'KERNEL' } = params;
        const codes = [];

        for (let i = 0; i < Math.min(count, 100); i++) {
          // Generate unique code
          const { data: code } = await supabase.rpc('generate_invite_code', { prefix });
          
          const { data, error } = await supabase
            .from('invite_codes')
            .insert({
              code,
              type,
              max_uses: type === 'single_use' ? 1 : max_uses,
              campaign,
              expires_at,
              created_by: user.id
            })
            .select()
            .single();

          if (error) {
            console.error('Error generating code:', error);
            continue;
          }
          codes.push(data);
        }

        console.log('Generated invite codes:', { count: codes.length, campaign, userId: user.id });

        return new Response(
          JSON.stringify({ success: true, codes }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list': {
        const { status, campaign, limit = 50, offset = 0 } = params;
        
        let query = supabase
          .from('invite_codes')
          .select('*, redemptions:invite_code_redemptions(count)')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status === 'active') {
          query = query.eq('is_active', true);
        } else if (status === 'inactive') {
          query = query.eq('is_active', false);
        }

        if (campaign) {
          query = query.eq('campaign', campaign);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error listing codes:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to list codes' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ codes: data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'deactivate': {
        const { code_id } = params;
        
        const { error } = await supabase
          .from('invite_codes')
          .update({ is_active: false })
          .eq('id', code_id);

        if (error) {
          console.error('Error deactivating code:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to deactivate code' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Deactivated invite code:', { codeId: code_id, userId: user.id });

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'activate': {
        const { code_id } = params;
        
        const { error } = await supabase
          .from('invite_codes')
          .update({ is_active: true })
          .eq('id', code_id);

        if (error) {
          console.error('Error activating code:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to activate code' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list_requests': {
        const { status = 'pending', limit = 50, offset = 0 } = params;
        
        let query = supabase
          .from('invite_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error listing requests:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to list requests' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ requests: data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'approve_request': {
        const { request_id, admin_notes } = params;
        
        // Get the request
        const { data: request, error: fetchError } = await supabase
          .from('invite_requests')
          .select('*')
          .eq('id', request_id)
          .single();

        if (fetchError || !request) {
          return new Response(
            JSON.stringify({ error: 'Request not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate an invite code for the user
        const { data: code } = await supabase.rpc('generate_invite_code', { prefix: 'KERNEL' });
        
        const { data: inviteCode, error: codeError } = await supabase
          .from('invite_codes')
          .insert({
            code,
            type: 'single_use',
            max_uses: 1,
            campaign: 'request_approved',
            notes: `Generated for ${request.email}`,
            created_by: user.id
          })
          .select()
          .single();

        if (codeError) {
          console.error('Error generating code for approval:', codeError);
          return new Response(
            JSON.stringify({ error: 'Failed to generate invite code' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update the request
        const { error: updateError } = await supabase
          .from('invite_requests')
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
            invite_code_id: inviteCode.id,
            admin_notes
          })
          .eq('id', request_id);

        if (updateError) {
          console.error('Error updating request:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update request' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Approved invite request:', { requestId: request_id, email: request.email, code });

        return new Response(
          JSON.stringify({ 
            success: true, 
            invite_code: code,
            email: request.email,
            name: request.name
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'reject_request': {
        const { request_id, admin_notes } = params;
        
        const { error } = await supabase
          .from('invite_requests')
          .update({
            status: 'rejected',
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
            admin_notes
          })
          .eq('id', request_id);

        if (error) {
          console.error('Error rejecting request:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to reject request' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Rejected invite request:', { requestId: request_id, userId: user.id });

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_stats': {
        // Get code stats
        const { data: codesTotal } = await supabase
          .from('invite_codes')
          .select('id', { count: 'exact' });

        const { data: codesActive } = await supabase
          .from('invite_codes')
          .select('id', { count: 'exact' })
          .eq('is_active', true);

        const { data: redemptionsTotal } = await supabase
          .from('invite_code_redemptions')
          .select('id', { count: 'exact' });

        const { data: requestsPending } = await supabase
          .from('invite_requests')
          .select('id', { count: 'exact' })
          .eq('status', 'pending');

        const { data: requestsApproved } = await supabase
          .from('invite_requests')
          .select('id', { count: 'exact' })
          .eq('status', 'approved');

        return new Response(
          JSON.stringify({
            total_codes: codesTotal?.length ?? 0,
            active_codes: codesActive?.length ?? 0,
            total_redemptions: redemptionsTotal?.length ?? 0,
            pending_requests: requestsPending?.length ?? 0,
            approved_requests: requestsApproved?.length ?? 0
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in manage-invite-codes:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});