import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model = "google/gemini-2.5-pro", lovableProjectUrl, lovableProjectName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let projectContext = "";
    if (lovableProjectUrl && lovableProjectName) {
      projectContext = `\n\nThe user is currently working on a Lovable project named "${lovableProjectName}".
Project URL: ${lovableProjectUrl}
When providing assistance, consider this project context. If the user asks about their project, you can reference this URL.`;
    }

    const systemPrompt = `You are the Lovable Expert Assistant, an AI companion designed specifically for power users who build applications on the Lovable platform.

Your expertise includes:
- React, TypeScript, Tailwind CSS, and Vite
- Supabase (database, auth, edge functions, storage)
- Shadcn/UI components
- Lovable-specific patterns and best practices

Guidelines:
- Provide concise, actionable responses
- Include code examples with proper syntax highlighting
- Use markdown formatting for structure
- When showing code, always specify the language for syntax highlighting
- Suggest optimizations and best practices
- Be direct and efficient - the user is an expert

When asked about Lovable features, reference the official documentation patterns.
When debugging, ask clarifying questions if needed.
Format your responses with clear sections using headers when appropriate.${projectContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
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
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
