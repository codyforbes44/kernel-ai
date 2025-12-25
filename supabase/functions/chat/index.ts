import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  buildChatSystemPrompt,
  type KnowledgeBaseContext,
  type ProjectContext,
} from "../_shared/prompts.ts";
import { AI_TRUST_COVENANT } from "../_shared/ai-trust-agreement.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation helpers
function isValidMessage(msg: unknown): msg is { role: string; content: string } {
  return (
    typeof msg === "object" &&
    msg !== null &&
    typeof (msg as Record<string, unknown>).role === "string" &&
    ["user", "assistant", "system"].includes((msg as Record<string, unknown>).role as string) &&
    typeof (msg as Record<string, unknown>).content === "string" &&
    ((msg as Record<string, unknown>).content as string).length <= 50000
  );
}

function isValidUrl(url: unknown): boolean {
  if (typeof url !== "string") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function sanitizeString(str: string, maxLength: number): string {
  return str.slice(0, maxLength).replace(/[<>]/g, "");
}

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  lovableProjectUrl?: string;
  lovableProjectName?: string;
  knowledgeBase?: KnowledgeBaseContext;
}

function validateChatRequest(body: unknown): { valid: true; data: ChatRequest } | { valid: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Invalid request body" };
  }

  const { messages, model, lovableProjectUrl, lovableProjectName, knowledgeBase } = body as Record<string, unknown>;

  // Validate messages array
  if (!Array.isArray(messages)) {
    return { valid: false, error: "messages must be an array" };
  }

  if (messages.length === 0) {
    return { valid: false, error: "messages array cannot be empty" };
  }

  if (messages.length > 100) {
    return { valid: false, error: "messages array exceeds maximum length of 100" };
  }

  for (let i = 0; i < messages.length; i++) {
    if (!isValidMessage(messages[i])) {
      return { valid: false, error: `Invalid message at index ${i}: must have valid role and content` };
    }
  }

  // Validate model (optional)
  if (model !== undefined && typeof model !== "string") {
    return { valid: false, error: "model must be a string" };
  }

  const allowedModels = [
    "google/gemini-2.5-flash",
    "google/gemini-2.5-pro",
    "google/gemini-3-pro-preview",
    "google/gemini-2.5-flash-lite",
    "openai/gpt-5",
    "openai/gpt-5-mini",
    "openai/gpt-5-nano",
  ];

  const selectedModel = typeof model === "string" ? model : "google/gemini-2.5-flash";
  if (!allowedModels.includes(selectedModel)) {
    return { valid: false, error: `Invalid model. Allowed: ${allowedModels.join(", ")}` };
  }

  // Validate URLs (optional)
  if (lovableProjectUrl !== undefined && lovableProjectUrl !== null) {
    if (typeof lovableProjectUrl !== "string" || !isValidUrl(lovableProjectUrl)) {
      return { valid: false, error: "lovableProjectUrl must be a valid URL" };
    }
  }

  // Validate project name (optional)
  if (lovableProjectName !== undefined && lovableProjectName !== null) {
    if (typeof lovableProjectName !== "string" || lovableProjectName.length > 200) {
      return { valid: false, error: "lovableProjectName must be a string with max 200 characters" };
    }
  }

  return {
    valid: true,
    data: {
      messages: messages as ChatRequest["messages"],
      model: selectedModel,
      lovableProjectUrl: typeof lovableProjectUrl === "string" ? lovableProjectUrl : undefined,
      lovableProjectName: typeof lovableProjectName === "string" ? sanitizeString(lovableProjectName, 200) : undefined,
      knowledgeBase: knowledgeBase as KnowledgeBaseContext | undefined,
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate input
    const validation = validateChatRequest(rawBody);
    if (!validation.valid) {
      console.log("[chat] Validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, model, lovableProjectUrl, lovableProjectName, knowledgeBase } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build project context
    const projectContext: ProjectContext = {
      url: lovableProjectUrl,
      name: lovableProjectName,
      knowledgeBase,
    };

    // Build system prompt using shared module (Trust Covenant is included via CORE_IDENTITY)
    const systemPrompt = buildChatSystemPrompt(projectContext);

    console.log("[chat] Processing request with model:", model);
    console.log("[chat] Knowledge base provided:", !!knowledgeBase);
    console.log("[chat] Trust Covenant bound: true");

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
