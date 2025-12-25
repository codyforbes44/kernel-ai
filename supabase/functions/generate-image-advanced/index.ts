import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerationRequest {
  prompt: string;
  model?: "flux-schnell" | "flux-dev" | "flux-pro" | "sdxl";
  aspectRatio?: string;
  style?: string;
  projectId?: string;
  // Advanced options
  negativePrompt?: string;
  guidanceScale?: number;
  numInferenceSteps?: number;
  seed?: number;
  // Image editing
  sourceImageUrl?: string;
  editMode?: "upscale" | "variation" | "inpaint" | "controlnet";
  upscaleScale?: number;
  // ControlNet options
  controlnetType?: "canny" | "depth" | "pose" | "scribble" | "softedge";
  controlnetStrength?: number;
}

const ASPECT_RATIO_TO_SIZE: Record<string, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1344, height: 768 },
  "9:16": { width: 768, height: 1344 },
  "4:3": { width: 1152, height: 896 },
  "3:4": { width: 896, height: 1152 },
  "21:9": { width: 1536, height: 640 },
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

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: GenerationRequest = await req.json();
    const {
      prompt,
      model = "flux-schnell",
      aspectRatio = "1:1",
      style = "realistic",
      projectId,
      negativePrompt,
      guidanceScale,
      numInferenceSteps,
      seed,
      sourceImageUrl,
      editMode,
      upscaleScale = 2,
      controlnetType = "canny",
      controlnetStrength = 0.8,
    } = body;

    console.log("[generate-image-advanced] Request:", { model, editMode, aspectRatio, hasSourceImage: !!sourceImageUrl, controlnetType });

    const replicate = new Replicate({ auth: REPLICATE_API_KEY });

    let output: unknown;
    let selectedModel: string;
    const size = ASPECT_RATIO_TO_SIZE[aspectRatio] || ASPECT_RATIO_TO_SIZE["1:1"];

    // Handle upscaling
    if (editMode === "upscale" && sourceImageUrl) {
      selectedModel = "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa";
      
      output = await replicate.run(selectedModel, {
        input: {
          image: sourceImageUrl,
          scale: upscaleScale,
          face_enhance: false,
        },
      });
      
      console.log("[generate-image-advanced] Upscale complete");
    } 
    // Handle ControlNet generation
    else if (editMode === "controlnet" && sourceImageUrl) {
      if (!prompt) {
        return new Response(JSON.stringify({ error: "Prompt is required for ControlNet generation" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Map ControlNet types to Replicate models
      const controlnetModels: Record<string, string> = {
        canny: "jagilley/controlnet-canny:aff48af9c68d162388d230a2ab003f68d2638d88307bdaf1c2f1ac95079c9613",
        depth: "jagilley/controlnet-depth:922c7bb67b87ec32cbc2fd11b1d5f94f0ba4f5519c4dbd02856f0b65a9473e5f",
        pose: "jagilley/controlnet-pose:0304f7f774ba7341ef754231f794b1ba3d129e3c46af3022241325ae0c50fb99",
        scribble: "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
        softedge: "jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56f55d0b78",
      };

      selectedModel = controlnetModels[controlnetType] || controlnetModels.canny;
      
      console.log("[generate-image-advanced] Using ControlNet model:", selectedModel, "type:", controlnetType);

      output = await replicate.run(selectedModel, {
        input: {
          image: sourceImageUrl,
          prompt: prompt,
          num_samples: "1",
          image_resolution: "512",
          ddim_steps: numInferenceSteps || 20,
          scale: guidanceScale || 9,
          a_prompt: "best quality, extremely detailed",
          n_prompt: negativePrompt || "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
          eta: 0,
          ...(seed !== undefined && { seed }),
        },
      });
      
      console.log("[generate-image-advanced] ControlNet generation complete");
    }
    // Handle variation (img2img)
    else if (editMode === "variation" && sourceImageUrl) {
      selectedModel = "black-forest-labs/flux-dev";
      
      output = await replicate.run(selectedModel, {
        input: {
          prompt: prompt || "high quality image",
          image: sourceImageUrl,
          prompt_strength: 0.8,
          num_outputs: 1,
          aspect_ratio: aspectRatio,
          output_format: "webp",
          output_quality: 90,
          guidance: guidanceScale || 3.5,
          num_inference_steps: numInferenceSteps || 28,
          ...(seed !== undefined && { seed }),
        },
      });
    }
    // Standard generation
    else {
      if (!prompt) {
        return new Response(JSON.stringify({ error: "Prompt is required for generation" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Enhance prompt with style
      const enhancedPrompt = style && style !== "realistic" 
        ? `${prompt}, ${style} style` 
        : prompt;

      switch (model) {
        case "flux-pro":
          selectedModel = "black-forest-labs/flux-1.1-pro";
          output = await replicate.run(selectedModel, {
            input: {
              prompt: enhancedPrompt,
              aspect_ratio: aspectRatio,
              output_format: "webp",
              output_quality: 90,
              safety_tolerance: 2,
              prompt_upsampling: true,
            },
          });
          break;

        case "flux-dev":
          selectedModel = "black-forest-labs/flux-dev";
          output = await replicate.run(selectedModel, {
            input: {
              prompt: enhancedPrompt,
              aspect_ratio: aspectRatio,
              output_format: "webp",
              output_quality: 90,
              guidance: guidanceScale || 3.5,
              num_inference_steps: numInferenceSteps || 28,
              ...(seed !== undefined && { seed }),
              ...(negativePrompt && { negative_prompt: negativePrompt }),
            },
          });
          break;

        case "sdxl":
          selectedModel = "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc";
          output = await replicate.run(selectedModel, {
            input: {
              prompt: enhancedPrompt,
              width: size.width,
              height: size.height,
              num_outputs: 1,
              scheduler: "K_EULER",
              num_inference_steps: numInferenceSteps || 50,
              guidance_scale: guidanceScale || 7.5,
              ...(negativePrompt && { negative_prompt: negativePrompt }),
              ...(seed !== undefined && { seed }),
            },
          });
          break;

        case "flux-schnell":
        default:
          selectedModel = "black-forest-labs/flux-schnell";
          output = await replicate.run(selectedModel, {
            input: {
              prompt: enhancedPrompt,
              aspect_ratio: aspectRatio,
              output_format: "webp",
              output_quality: 90,
              num_outputs: 1,
              go_fast: true,
            },
          });
          break;
      }
    }

    // Extract image URL
    let imageUrl: string;
    if (typeof output === "string") {
      imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
    } else {
      console.error("[generate-image-advanced] Unexpected output:", output);
      throw new Error("Unexpected output format from image generation");
    }

    console.log("[generate-image-advanced] Generated image URL:", imageUrl);

    // Fetch and upload to storage
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch generated image: ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    const contentType = imageBlob.type || "image/webp";
    const extension = contentType.includes("png") ? "png" : "webp";
    const fileName = `${user.id}/${Date.now()}-${editMode || "gen"}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("ai-assets")
      .upload(fileName, imageBlob, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("[generate-image-advanced] Upload error:", uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from("ai-assets").getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    // Save to database
    const { data: assetData, error: dbError } = await supabase
      .from("generated_assets")
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        prompt: prompt || `${editMode} of existing image`,
        storage_path: fileName,
        storage_url: publicUrl,
        asset_type: "image",
        aspect_ratio: aspectRatio,
        style: editMode === "upscale" ? "upscaled" : (style || "realistic"),
        mime_type: contentType,
        width: editMode === "upscale" ? size.width * upscaleScale : size.width,
        height: editMode === "upscale" ? size.height * upscaleScale : size.height,
        metadata: {
          model: selectedModel,
          edit_mode: editMode || null,
          source_image: sourceImageUrl || null,
          guidance_scale: guidanceScale,
          num_inference_steps: numInferenceSteps,
          seed,
          controlnet_type: editMode === "controlnet" ? controlnetType : null,
          controlnet_strength: editMode === "controlnet" ? controlnetStrength : null,
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error("[generate-image-advanced] Database error:", dbError);
      throw new Error(`Failed to save asset: ${dbError.message}`);
    }

    console.log("[generate-image-advanced] Successfully saved asset:", assetData.id);

    return new Response(
      JSON.stringify({
        success: true,
        asset: assetData,
        imageUrl: publicUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-image-advanced] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
