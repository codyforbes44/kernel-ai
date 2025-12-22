import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileContext {
  path: string;
  content: string;
  type: string;
}

interface AgentMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface ErrorContext {
  message: string;
  file?: string;
  line?: number;
  stack?: string;
}

const AGENT_TOOLS = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the complete contents of a file. Use this to understand existing code before making changes.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path to read (e.g., 'src/App.tsx')"
          }
        },
        required: ["path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_files",
      description: "Search for text patterns across all files. Use this to find where something is defined or used.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The text or pattern to search for"
          },
          filePattern: {
            type: "string",
            description: "Optional file pattern to filter (e.g., '*.tsx', 'components/*')"
          },
          maxResults: {
            type: "number",
            description: "Maximum number of results to return (default: 20)"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List files in the project. Use this to understand the project structure.",
      parameters: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            description: "Optional glob pattern to filter files (e.g., 'src/components/*.tsx')"
          },
          directory: {
            type: "string",
            description: "Optional directory to list files from"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "apply_changes",
      description: "Apply file changes (create, update, or delete files). Use this after you have fully understood the codebase and planned your changes.",
      parameters: {
        type: "object",
        properties: {
          operations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["create", "update", "delete"],
                  description: "The type of operation"
                },
                path: {
                  type: "string",
                  description: "The file path"
                },
                content: {
                  type: "string",
                  description: "The file content (for create/update)"
                },
                reason: {
                  type: "string",
                  description: "Brief explanation of why this change is needed"
                }
              },
              required: ["type", "path"]
            },
            description: "Array of file operations to apply"
          },
          explanation: {
            type: "string",
            description: "Overall explanation of what these changes accomplish"
          }
        },
        required: ["operations", "explanation"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_errors",
      description: "Get current build or runtime errors. Use this after applying changes to verify they work.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];

const SYSTEM_PROMPT = `You are an AI Agent with multi-step reasoning capabilities for code generation and modification. You work autonomously to understand codebases and make changes.

## Your Capabilities

You have access to these tools:
1. **read_file**: Read a file's complete content to understand it
2. **search_files**: Search for patterns across the codebase
3. **list_files**: List project files to understand structure
4. **apply_changes**: Create, update, or delete files
5. **get_errors**: Check for build/runtime errors after changes

## Workflow

For complex tasks, follow this workflow:

1. **UNDERSTAND**: First explore the codebase
   - Use list_files to see project structure
   - Use search_files to find relevant code
   - Use read_file to understand specific files

2. **PLAN**: Think through your approach
   - Consider what files need to change
   - Plan the order of changes
   - Identify potential issues

3. **IMPLEMENT**: Apply your changes
   - Use apply_changes with all necessary operations
   - Include clear explanations for each change

4. **VERIFY**: Check your work
   - Use get_errors to check for problems
   - If errors exist, analyze and fix them

## Rules

1. **Always explore before changing**: Read relevant files before modifying them
2. **Make complete changes**: Include all necessary imports, types, and related updates
3. **Explain your thinking**: Use clear reasoning in your responses
4. **Self-correct**: If you find errors, fix them automatically (up to 5 iterations)
5. **Follow existing patterns**: Match the code style in the project
6. **Use TypeScript properly**: Include proper types and interfaces
7. **Keep components focused**: Create small, reusable components

## Response Format

Always structure your responses with:
1. **Thinking**: Explain what you're doing and why
2. **Actions**: Call appropriate tools
3. **Summary**: After changes, summarize what was done

When you have completed all changes successfully, end with "AGENT_COMPLETE" to signal you're done.

If you cannot complete the task or need user input, explain what's blocking you.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      messages, 
      files, 
      errors,
      toolResults,
      iterationCount = 0,
      maxIterations = 5 
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build file context summary
    const fileList = (files as FileContext[]).map(f => f.path).join('\n');
    const fileContext = `## Available Files\n${fileList}\n\n`;

    // Build error context if any
    let errorContext = '';
    if (errors && errors.length > 0) {
      errorContext = `## Current Errors\n${(errors as ErrorContext[]).map(e => 
        `- ${e.message}${e.file ? ` (${e.file}:${e.line || '?'})` : ''}`
      ).join('\n')}\n\n`;
    }

    // Build the messages array for the API
    const apiMessages: AgentMessage[] = [
      { 
        role: 'user', 
        content: `${fileContext}${errorContext}${messages[0].content}` 
      }
    ];

    // Add conversation history (skip first user message as we enhanced it)
    for (let i = 1; i < messages.length; i++) {
      apiMessages.push(messages[i]);
    }

    // Add tool results if any
    if (toolResults && toolResults.length > 0) {
      for (const result of toolResults) {
        apiMessages.push({
          role: 'tool',
          tool_call_id: result.toolCallId,
          content: JSON.stringify(result.data)
        });
      }
    }

    console.log(`Agent iteration ${iterationCount}/${maxIterations}`);
    console.log(`Messages: ${apiMessages.length}, Tools: ${AGENT_TOOLS.length}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...apiMessages,
        ],
        tools: AGENT_TOOLS,
        tool_choice: "auto",
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error", details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Agent error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
