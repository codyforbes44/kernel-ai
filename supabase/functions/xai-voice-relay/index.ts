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

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400, 
      headers: corsHeaders 
    });
  }

  const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
  if (!XAI_API_KEY) {
    return new Response("XAI_API_KEY not configured", { 
      status: 500, 
      headers: corsHeaders 
    });
  }

  // Get voice config from query params
  const url = new URL(req.url);
  const voice = url.searchParams.get('voice') || 'Charon';
  const systemPrompt = url.searchParams.get('systemPrompt') || 'You are a helpful companion.';
  const inputMode = url.searchParams.get('inputMode') || 'vad';

  console.log(`Starting xAI voice relay - Voice: ${voice}`);

  const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);

  // Connect to xAI Realtime API
  const xaiSocket = new WebSocket("wss://api.x.ai/v1/realtime?model=grok-3-fast", [
    "realtime",
    `api-key.${XAI_API_KEY}`,
  ]);

  let sessionConfigured = false;

  xaiSocket.onopen = () => {
    console.log("Connected to xAI Realtime API");
  };

  xaiSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("xAI event:", data.type);

      // Configure session after receiving session.created
      if (data.type === 'session.created' && !sessionConfigured) {
        sessionConfigured = true;
        
        const sessionUpdate = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: systemPrompt,
            voice: voice,
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-large-v3-turbo"
            },
            turn_detection: inputMode === 'push-to-talk' ? null : {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 800
            },
            temperature: 0.8
          }
        };
        
        xaiSocket.send(JSON.stringify(sessionUpdate));
        console.log("Session configured with voice:", voice);
      }

      // Forward all events to client
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(event.data);
      }
    } catch (error) {
      console.error("Error processing xAI message:", error);
    }
  };

  xaiSocket.onerror = (error) => {
    console.error("xAI WebSocket error:", error);
  };

  xaiSocket.onclose = (event) => {
    console.log("xAI connection closed:", event.code, event.reason);
    if (clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.close();
    }
  };

  // Handle client messages
  clientSocket.onmessage = (event) => {
    try {
      if (xaiSocket.readyState === WebSocket.OPEN) {
        xaiSocket.send(event.data);
      }
    } catch (error) {
      console.error("Error forwarding client message:", error);
    }
  };

  clientSocket.onclose = () => {
    console.log("Client disconnected");
    if (xaiSocket.readyState === WebSocket.OPEN) {
      xaiSocket.close();
    }
  };

  clientSocket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
  };

  return response;
});
