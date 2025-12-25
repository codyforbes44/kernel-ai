import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import {
  buildScreenshotToCodePrompt,
  type KnowledgeBaseContext,
} from "../_shared/prompts.ts";

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

    const { 
      imageUrl, 
      imageBase64, 
      description, 
      componentName = "GeneratedComponent",
      conventions,
    } = await req.json();

    if (!imageUrl && !imageBase64 && !description) {
      return new Response(
        JSON.stringify({ error: "Image URL, base64 image, or description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system prompt using shared module with conventions
    const systemPrompt = buildScreenshotToCodePrompt(conventions as KnowledgeBaseContext['conventions']);

    // Build the message content
    const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

    // Add the instruction text
    let instructionText = `Convert this UI design into a React component with Tailwind CSS.
Component name: ${componentName}`;

    if (description) {
      instructionText += `\n\nAdditional context: ${description}`;
    }

    messageContent.push({ type: "text", text: instructionText });

    // Add image if provided
    if (imageUrl) {
      messageContent.push({
        type: "image_url",
        image_url: { url: imageUrl },
      });
    } else if (imageBase64) {
      messageContent.push({
        type: "image_url",
        image_url: { url: imageBase64 },
      });
    }

    console.log("[screenshot-to-code] Converting screenshot to code...");
    console.log("[screenshot-to-code] Conventions provided:", !!conventions);

    // Use Gemini Pro for vision capabilities
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: messageContent },
        ],
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
    let generatedCode = data.choices?.[0]?.message?.content;

    if (!generatedCode) {
      throw new Error("No code generated");
    }

    // Clean up the code - remove markdown code blocks if present
    generatedCode = generatedCode
      .replace(/^```(?:tsx?|jsx?|react)?\n?/gm, "")
      .replace(/\n?```$/gm, "")
      .trim();

    console.log("[screenshot-to-code] Code generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        code: generatedCode,
        componentName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in screenshot-to-code:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
