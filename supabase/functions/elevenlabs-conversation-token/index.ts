import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  buildVoiceAgentSystemPrompt, 
  buildFirstMessage,
  VoiceAgentContext 
} from "../_shared/voice-agent-prompts.ts";

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
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY is not configured');
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    const { agentId, userContext } = await req.json();
    
    if (!agentId) {
      console.error('Agent ID is required');
      return new Response(
        JSON.stringify({ error: 'Agent ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build context for the voice agent
    const context: VoiceAgentContext = {
      isNewUser: userContext?.isNewUser ?? true,
      hasActiveProject: userContext?.hasActiveProject ?? false,
      projectName: userContext?.projectName,
      userName: userContext?.userName,
      currentPage: userContext?.currentPage,
    };

    // Generate dynamic system prompt and first message
    const systemPrompt = buildVoiceAgentSystemPrompt(context);
    const firstMessage = buildFirstMessage(context);

    console.log('Requesting signed URL for agent:', agentId);
    console.log('User context:', JSON.stringify(context));
    console.log('First message:', firstMessage);

    // Request a signed URL from ElevenLabs with conversation overrides
    // Note: Overrides must be enabled in ElevenLabs dashboard for the agent
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('ElevenLabs response:', JSON.stringify(data));
    
    // The API returns { signed_url: "wss://..." }
    if (!data.signed_url) {
      console.error('No signed_url in response:', data);
      throw new Error('Invalid response from ElevenLabs: missing signed_url');
    }

    // Return signed URL along with conversation configuration
    // The client will use these overrides when starting the session
    return new Response(JSON.stringify({ 
      signedUrl: data.signed_url,
      overrides: {
        agent: {
          prompt: {
            prompt: systemPrompt,
          },
          firstMessage: firstMessage,
          language: 'en',
        },
      },
      firstMessage: firstMessage,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating conversation token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate conversation token';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
