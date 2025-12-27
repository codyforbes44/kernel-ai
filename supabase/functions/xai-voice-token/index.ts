import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
    if (!XAI_API_KEY) {
      throw new Error('XAI_API_KEY is not configured');
    }

    const { voice, systemPrompt, companionName } = await req.json();

    // xAI Realtime API uses WebSocket directly, but we need to provide 
    // connection details and validate the request
    // The API key will be used client-side through the edge function proxy
    
    console.log(`Creating voice session for companion: ${companionName}, voice: ${voice}`);

    // Return connection configuration
    // Note: xAI doesn't have an ephemeral token endpoint like OpenAI
    // We'll proxy the WebSocket connection through another edge function
    return new Response(
      JSON.stringify({
        success: true,
        config: {
          voice: voice || 'Charon',
          model: 'grok-3-fast',
          systemPrompt: systemPrompt || `You are ${companionName || 'a helpful companion'}.`,
        },
        // We'll use a WebSocket relay edge function
        wsEndpoint: `wss://ggistvtwgeokhvfagocs.functions.supabase.co/functions/v1/xai-voice-relay`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error creating voice session:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
