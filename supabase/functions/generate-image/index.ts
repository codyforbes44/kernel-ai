import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt, style = "realistic", aspectRatio = "1:1", projectId, editImageUrl, editMode = false } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate edit mode has image
    if (editMode && !editImageUrl) {
      return new Response(JSON.stringify({ error: "Image URL required for edit mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enhance prompt with style
    const stylePrompts: Record<string, string> = {
      realistic: "photorealistic, high quality, detailed",
      illustration: "digital illustration, artistic, vibrant colors",
      icon: "flat icon design, simple, clean lines, minimal",
      "3d": "3D rendered, volumetric lighting, high detail",
      abstract: "abstract art, creative, unique patterns",
      minimal: "minimalist design, clean, simple shapes",
    };

    const enhancedPrompt = editMode 
      ? prompt 
      : `${prompt}. Style: ${stylePrompts[style] || stylePrompts.realistic}. Ultra high resolution.`;

    console.log(editMode ? "Editing image with prompt:" : "Generating image with prompt:", enhancedPrompt);

    // Build message content based on mode
    let messageContent: any;
    if (editMode && editImageUrl) {
      messageContent = [
        { type: "text", text: enhancedPrompt },
        { type: "image_url", image_url: { url: editImageUrl } }
      ];
    } else {
      messageContent = enhancedPrompt;
    }

    // Call Lovable AI with image generation model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: messageContent,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Insufficient credits. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageData) {
      throw new Error("No image generated");
    }

    // Extract base64 data
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image data format");
    }

    const imageFormat = base64Match[1];
    const base64Data = base64Match[2];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${user.id}/${timestamp}-${style}.${imageFormat}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("ai-assets")
      .upload(filename, binaryData, {
        contentType: `image/${imageFormat}`,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("ai-assets").getPublicUrl(filename);
    const storageUrl = urlData.publicUrl;

    // Save to database
    const { data: assetData, error: assetError } = await supabase
      .from("generated_assets")
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        prompt,
        style,
        aspect_ratio: aspectRatio,
        asset_type: "image",
        storage_path: filename,
        storage_url: storageUrl,
        mime_type: `image/${imageFormat}`,
        file_size: binaryData.length,
        metadata: { enhanced_prompt: enhancedPrompt },
      })
      .select()
      .single();

    if (assetError) {
      console.error("Database insert error:", assetError);
      // Still return the image even if DB save fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        asset: assetData || {
          storage_url: storageUrl,
          storage_path: filename,
          prompt,
          style,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
