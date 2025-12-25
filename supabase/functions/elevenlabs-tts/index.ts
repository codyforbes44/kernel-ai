import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  speed?: number;
}

interface TTSRequest {
  text: string;
  voiceId?: string;
  model?: 'eleven_turbo_v2_5' | 'eleven_multilingual_v2';
  outputFormat?: 'mp3_44100_128' | 'mp3_22050_32';
  voiceSettings?: VoiceSettings;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      text, 
      voiceId = 'JBFqnCBsd6RMkjVDRZzb',
      model = 'eleven_turbo_v2_5',
      outputFormat = 'mp3_44100_128',
      voiceSettings = {}
    }: TTSRequest = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Truncate very long text to avoid API limits
    const truncatedText = text.slice(0, 5000);

    // Merge with defaults
    const finalVoiceSettings = {
      stability: voiceSettings.stability ?? 0.5,
      similarity_boost: voiceSettings.similarity_boost ?? 0.75,
      style: voiceSettings.style ?? 0.3,
      use_speaker_boost: voiceSettings.use_speaker_boost ?? true,
    };

    console.log(`Generating TTS for ${truncatedText.length} chars with voice ${voiceId}, model ${model}`);

    const requestBody: Record<string, unknown> = {
      text: truncatedText,
      model_id: model,
      output_format: outputFormat,
      voice_settings: finalVoiceSettings,
    };

    // Add speed if provided (not all models support it)
    if (voiceSettings.speed !== undefined && voiceSettings.speed !== 1.0) {
      // Speed is handled differently in the API - it's part of generation config
      // For now we'll include it in the voice_settings as some models support it
      (requestBody.voice_settings as Record<string, unknown>).speed = voiceSettings.speed;
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `TTS generation failed: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`Generated ${audioBuffer.byteLength} bytes of audio`);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: unknown) {
    console.error('TTS error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
