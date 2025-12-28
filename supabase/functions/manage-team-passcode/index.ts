import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// PBKDF2 iterations - OWASP 2023 recommendation
const PBKDF2_ITERATIONS = 600000

// Secure PBKDF2 hash function with unique random salt per passcode
async function hashPasscode(passcode: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const encoder = new TextEncoder()
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passcode),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  )
  
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const saltArray = Array.from(salt)
  
  // Store as salt:hash format
  return `${saltArray.map(b => b.toString(16).padStart(2, '0')).join('')}:${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`
}

// Generate random 6-digit passcode
function generateRandomPasscode(): string {
  const array = new Uint8Array(3)
  crypto.getRandomValues(array)
  // Convert to 6 digit number
  const num = (array[0] * 65536 + array[1] * 256 + array[2]) % 1000000
  return num.toString().padStart(6, '0')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    // Create client with user's token to verify they're an admin
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    
    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()
    
    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    
    const { action, passcode, sessionDurationHours, isEnabled } = await req.json()
    
    switch (action) {
      case 'get_config': {
        const { data: config } = await supabase
          .from('team_access_config')
          .select('*')
          .limit(1)
          .single()
        
        const { data: sessions } = await supabase
          .from('team_access_sessions')
          .select('*')
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            config: config || null,
            activeSessions: sessions || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      case 'set_passcode': {
        // Use provided passcode or generate a random one
        const newPasscode = passcode || generateRandomPasscode()
        
        if (!/^\d{6}$/.test(newPasscode)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Passcode must be exactly 6 digits' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }
        
        const hashedPasscode = await hashPasscode(newPasscode)
        
        // Check if config exists
        const { data: existingConfig } = await supabase
          .from('team_access_config')
          .select('id')
          .limit(1)
          .single()
        
        if (existingConfig) {
          // Update existing
          await supabase
            .from('team_access_config')
            .update({
              passcode_hash: hashedPasscode,
              updated_at: new Date().toISOString(),
              updated_by: user.id
            })
            .eq('id', existingConfig.id)
        } else {
          // Insert new
          await supabase
            .from('team_access_config')
            .insert({
              passcode_hash: hashedPasscode,
              is_enabled: true,
              session_duration_hours: 24,
              updated_by: user.id
            })
        }
        
        // Log to audit
        await supabase.from('admin_audit_log').insert({
          admin_user_id: user.id,
          action: 'set_team_passcode',
          target_type: 'team_access',
          details: { generated: !passcode }
        })
        
        console.log(`Team passcode ${passcode ? 'set' : 'generated'} by admin ${user.id}`)
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            passcode: newPasscode,
            message: 'Passcode set successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      case 'toggle_enabled': {
        const { data: existingConfig } = await supabase
          .from('team_access_config')
          .select('id')
          .limit(1)
          .single()
        
        if (!existingConfig) {
          return new Response(
            JSON.stringify({ success: false, error: 'No passcode configured yet' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }
        
        await supabase
          .from('team_access_config')
          .update({
            is_enabled: isEnabled,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          })
          .eq('id', existingConfig.id)
        
        // Log to audit
        await supabase.from('admin_audit_log').insert({
          admin_user_id: user.id,
          action: isEnabled ? 'enable_team_access' : 'disable_team_access',
          target_type: 'team_access',
          details: {}
        })
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Team access ${isEnabled ? 'enabled' : 'disabled'}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      case 'update_duration': {
        const { data: existingConfig } = await supabase
          .from('team_access_config')
          .select('id')
          .limit(1)
          .single()
        
        if (!existingConfig) {
          return new Response(
            JSON.stringify({ success: false, error: 'No passcode configured yet' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }
        
        const duration = Math.min(Math.max(sessionDurationHours || 24, 1), 168) // 1-168 hours
        
        await supabase
          .from('team_access_config')
          .update({
            session_duration_hours: duration,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          })
          .eq('id', existingConfig.id)
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Session duration updated to ${duration} hours`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      case 'revoke_session': {
        const { sessionId } = await req.json()
        
        await supabase
          .from('team_access_sessions')
          .update({ is_active: false })
          .eq('id', sessionId)
        
        // Log to audit
        await supabase.from('admin_audit_log').insert({
          admin_user_id: user.id,
          action: 'revoke_team_session',
          target_type: 'team_access_session',
          target_id: sessionId,
          details: {}
        })
        
        return new Response(
          JSON.stringify({ success: true, message: 'Session revoked' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      case 'revoke_all_sessions': {
        const { data: revokedSessions } = await supabase
          .from('team_access_sessions')
          .update({ is_active: false })
          .eq('is_active', true)
          .select('id')
        
        // Log to audit
        await supabase.from('admin_audit_log').insert({
          admin_user_id: user.id,
          action: 'revoke_all_team_sessions',
          target_type: 'team_access',
          details: { count: revokedSessions?.length || 0 }
        })
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `${revokedSessions?.length || 0} session(s) revoked`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      case 'validate_session': {
        const { sessionToken } = await req.json()
        
        if (!sessionToken) {
          return new Response(
            JSON.stringify({ success: false, valid: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const { data: session } = await supabase
          .from('team_access_sessions')
          .select('*')
          .eq('session_token', sessionToken)
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())
          .single()
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            valid: !!session,
            session: session ? {
              displayName: session.display_name,
              expiresAt: session.expires_at,
              createdAt: session.created_at
            } : null
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in manage-team-passcode:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})