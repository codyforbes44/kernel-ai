import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple hash function for passcode verification (using Web Crypto API)
async function hashPasscode(passcode: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(passcode + 'team_access_salt_v1')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Generate secure session token
function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { passcode, displayName } = await req.json()
    
    // Get client IP from headers
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      req.headers.get('cf-connecting-ip') || 
                      'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    // Check rate limiting - max 5 failed attempts per IP in 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    
    const { data: recentAttempts, error: attemptsError } = await supabase
      .from('team_access_attempts')
      .select('id')
      .eq('ip_address', ipAddress)
      .eq('success', false)
      .gte('attempted_at', fifteenMinutesAgo)
    
    if (attemptsError) {
      console.error('Error checking rate limit:', attemptsError)
    }
    
    const failedAttempts = recentAttempts?.length || 0
    const maxAttempts = 5
    
    if (failedAttempts >= maxAttempts) {
      // Log the blocked attempt
      await supabase.from('team_access_attempts').insert({
        ip_address: ipAddress,
        success: false
      })
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Too many failed attempts. Please try again in 15 minutes.',
          remainingAttempts: 0,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }
    
    // Get team access config
    const { data: config, error: configError } = await supabase
      .from('team_access_config')
      .select('*')
      .limit(1)
      .single()
    
    if (configError || !config) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Team access is not configured.',
          remainingAttempts: maxAttempts - failedAttempts
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    if (!config.is_enabled) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Team access is currently disabled.',
          remainingAttempts: maxAttempts - failedAttempts
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    
    // Validate passcode
    if (!passcode || typeof passcode !== 'string' || passcode.length !== 6) {
      await supabase.from('team_access_attempts').insert({
        ip_address: ipAddress,
        success: false
      })
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid passcode format.',
          remainingAttempts: maxAttempts - failedAttempts - 1
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Hash and compare
    const hashedInput = await hashPasscode(passcode)
    
    if (hashedInput !== config.passcode_hash) {
      // Log failed attempt
      await supabase.from('team_access_attempts').insert({
        ip_address: ipAddress,
        success: false
      })
      
      const remaining = maxAttempts - failedAttempts - 1
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: remaining > 0 
            ? `Invalid passcode. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
            : 'Invalid passcode. You have been locked out for 15 minutes.',
          remainingAttempts: remaining
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    // Passcode is valid! Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + (config.session_duration_hours || 24) * 60 * 60 * 1000)
    
    const { error: sessionError } = await supabase
      .from('team_access_sessions')
      .insert({
        session_token: sessionToken,
        display_name: displayName?.trim() || 'Team Member',
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt.toISOString(),
        is_active: true
      })
    
    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create session.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Log successful attempt
    await supabase.from('team_access_attempts').insert({
      ip_address: ipAddress,
      success: true
    })
    
    // Clean up old attempts (older than 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    await supabase
      .from('team_access_attempts')
      .delete()
      .lt('attempted_at', oneDayAgo)
    
    console.log(`Team access granted for ${displayName || 'Team Member'} from ${ipAddress}`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        sessionToken,
        expiresAt: expiresAt.toISOString(),
        displayName: displayName?.trim() || 'Team Member'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in verify-team-passcode:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})