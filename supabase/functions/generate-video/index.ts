import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt, sourceImageUrl, duration = 4, aspectRatio = "16:9", projectId, model = "luma" } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[generate-video] Starting generation:", { prompt, model, duration, aspectRatio, hasSourceImage: !!sourceImageUrl });

    const replicate = new Replicate({ auth: REPLICATE_API_KEY });

    let output: unknown;
    let selectedModel: string;

    if (model === "luma" || model === "dream-machine") {
      // Luma Dream Machine - text to video or image to video
      selectedModel = "luma/ray";
      const input: Record<string, unknown> = {
        prompt,
        aspect_ratio: aspectRatio,
        loop: false,
      };
      
      if (sourceImageUrl) {
        input.start_image_url = sourceImageUrl;
      }

      console.log("[generate-video] Running Luma Ray with input:", input);
      output = await replicate.run(selectedModel, { input });
    } else if (model === "stable-video") {
      // Stable Video Diffusion - image to video only
      if (!sourceImageUrl) {
        return new Response(JSON.stringify({ error: "Stable Video Diffusion requires a source image" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      selectedModel = "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438";
      output = await replicate.run(selectedModel, {
        input: {
          input_image: sourceImageUrl,
          cond_aug: 0.02,
          decoding_t: 7,
          video_length: "14_frames_with_svd",
          sizing_strategy: "maintain_aspect_ratio",
          motion_bucket_id: 127,
          fps: 7,
        },
      });
    } else if (model === "kling") {
      // Kling video model
      selectedModel = "fofr/kling-v1.5-pro";
      const input: Record<string, unknown> = {
        prompt,
        duration: String(duration),
        aspect_ratio: aspectRatio,
      };
      
      if (sourceImageUrl) {
        input.image = sourceImageUrl;
      }

      output = await replicate.run(selectedModel, { input });
    } else {
      // Default to minimax for fast generation
      selectedModel = "minimax/video-01";
      output = await replicate.run(selectedModel, {
        input: {
          prompt,
          prompt_optimizer: true,
        },
      });
    }

    console.log("[generate-video] Generation complete, output type:", typeof output);

    // Extract video URL from output
    let videoUrl: string;
    if (typeof output === "string") {
      videoUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      videoUrl = output[0];
    } else if (output && typeof output === "object" && "video" in output) {
      videoUrl = (output as { video: string }).video;
    } else {
      console.error("[generate-video] Unexpected output format:", output);
      throw new Error("Unexpected output format from video generation");
    }

    console.log("[generate-video] Video URL:", videoUrl);

    // Fetch the video and upload to Supabase Storage
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch generated video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    const fileName = `${user.id}/${Date.now()}-video.mp4`;

    const { error: uploadError } = await supabase.storage
      .from("ai-assets")
      .upload(fileName, videoBlob, {
        contentType: "video/mp4",
        upsert: false,
      });

    if (uploadError) {
      console.error("[generate-video] Upload error:", uploadError);
      throw new Error(`Failed to upload video: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("ai-assets").getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    // Generate thumbnail from first frame (optional - use video URL for now)
    const thumbnailUrl = videoUrl; // Could generate actual thumbnail later

    // Save to database
    const { data: assetData, error: dbError } = await supabase
      .from("generated_assets")
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        prompt,
        storage_path: fileName,
        storage_url: publicUrl,
        asset_type: "video",
        aspect_ratio: aspectRatio,
        duration,
        video_thumbnail_url: thumbnailUrl,
        style: model,
        mime_type: "video/mp4",
        metadata: {
          model: selectedModel,
          has_source_image: !!sourceImageUrl,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error("[generate-video] Database error:", dbError);
      throw new Error(`Failed to save asset: ${dbError.message}`);
    }

    console.log("[generate-video] Successfully generated and saved video:", assetData.id);

    return new Response(
      JSON.stringify({
        success: true,
        asset: assetData,
        videoUrl: publicUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-video] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
