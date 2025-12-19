import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileContext {
  path: string;
  content: string;
  language: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are an expert React/TypeScript developer assistant that helps users build web applications. Your job is to generate, modify, or delete files based on user requests.

IMPORTANT: You must respond with a JSON object containing:
1. "thinking" - Brief explanation of what you're doing (1-2 sentences)
2. "operations" - An array of file operations to perform

Each operation must have:
- "type": "create" | "update" | "delete"
- "path": The file path (e.g., "/src/App.tsx")
- "content": The full file content (for create/update only)

Rules:
- Generate complete, working React code with TypeScript
- Use modern React patterns (hooks, functional components)
- Include proper imports
- Use inline styles or CSS-in-JS when needed
- Make code clean, readable, and well-structured
- If updating a file, include the COMPLETE new file content
- Always use proper TypeScript types

Example response:
{
  "thinking": "I'll create a new Button component with hover effects.",
  "operations": [
    {
      "type": "create",
      "path": "/src/components/Button.tsx",
      "content": "import React from 'react';\\n\\ninterface ButtonProps {\\n  children: React.ReactNode;\\n  onClick?: () => void;\\n}\\n\\nexport function Button({ children, onClick }: ButtonProps) {\\n  return (\\n    <button onClick={onClick} style={{ padding: '8px 16px' }}>\\n      {children}\\n    </button>\\n  );\\n}"
    }
  ]
}

Respond ONLY with valid JSON. No markdown, no code blocks, just the raw JSON object.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, files } = await req.json() as {
      messages: Message[];
      files: FileContext[];
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from current files
    const fileContext = files.length > 0 
      ? `\n\nCurrent project files:\n${files.map(f => 
          `--- ${f.path} ---\n${f.content}\n`
        ).join('\n')}`
      : '';

    const fullSystemPrompt = SYSTEM_PROMPT + fileContext;

    console.log(`Processing streaming builder AI request with ${files.length} files in context`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Return the streaming response
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Builder AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
