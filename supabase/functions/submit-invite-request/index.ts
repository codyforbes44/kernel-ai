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

    const { email, name, use_case } = await req.json();

    // Validate required fields
    if (!email || !name || !use_case) {
      return new Response(
        JSON.stringify({ error: 'Email, name, and use case are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate use case length
    if (use_case.length < 20) {
      return new Response(
        JSON.stringify({ error: 'Please provide more detail about your use case (at least 20 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (use_case.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Use case is too long (max 2000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing pending request with this email
    const { data: existingRequest } = await supabase
      .from('invite_requests')
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'pending')
      .maybeSingle();

    if (existingRequest) {
      return new Response(
        JSON.stringify({ error: 'You already have a pending invite request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert the request
    const { data, error } = await supabase
      .from('invite_requests')
      .insert({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        use_case: use_case.trim(),
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting invite request:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to submit request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Invite request submitted:', { email, name, id: data.id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Your request has been submitted. We\'ll be in touch if you\'re selected for early access!' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in submit-invite-request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});