import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AI_TRUST_COVENANT } from "../_shared/ai-trust-agreement.ts";
import { AGENT_COORDINATION_PROTOCOL } from "../_shared/agent-coordination.ts";

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
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ErrorContext {
  type: 'build' | 'runtime' | 'typescript';
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
}

interface KnowledgeBaseContext {
  instructions?: string;
  techStack?: Array<{ name: string; version?: string; notes?: string }>;
  conventions?: {
    componentNaming?: string;
    fileNaming?: string;
    stateManagement?: string;
    styling?: string;
    customRules?: string[];
  };
  contextDocs?: Array<{ title: string; content: string; type: string }>;
}

interface ProjectAnalysis {
  dependencyGraph: Record<string, string[]>;
  componentMap: Record<string, { exports: string[]; props?: string[] }>;
  entryPoints: string[];
  cssFiles: string[];
  configFiles: string[];
}

// Analyze project structure for multi-file reasoning
function analyzeProject(files: FileContext[]): ProjectAnalysis {
  const analysis: ProjectAnalysis = {
    dependencyGraph: {},
    componentMap: {},
    entryPoints: [],
    cssFiles: [],
    configFiles: [],
  };

  for (const file of files) {
    const { path, content } = file;
    
    // Identify entry points
    if (path.includes('main.tsx') || path.includes('index.tsx') || path.includes('App.tsx')) {
      analysis.entryPoints.push(path);
    }
    
    // Identify CSS files
    if (path.endsWith('.css') || path.endsWith('.scss')) {
      analysis.cssFiles.push(path);
    }
    
    // Identify config files
    if (path.includes('config') || path.includes('tailwind') || path.includes('vite')) {
      analysis.configFiles.push(path);
    }
    
    // Parse imports to build dependency graph
    const importRegex = /import\s+(?:{[^}]*}|[^;{]*)\s+from\s+['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      // Resolve relative imports
      if (importPath.startsWith('.') || importPath.startsWith('@/')) {
        imports.push(importPath);
      }
    }
    
    if (imports.length > 0) {
      analysis.dependencyGraph[path] = imports;
    }
    
    // Detect React components and their exports
    const componentRegex = /export\s+(?:default\s+)?(?:function|const)\s+(\w+)/g;
    const exports: string[] = [];
    
    while ((match = componentRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    // Detect props interfaces
    const propsRegex = /interface\s+(\w+Props)\s*\{([^}]+)\}/g;
    const props: string[] = [];
    
    while ((match = propsRegex.exec(content)) !== null) {
      props.push(match[1]);
    }
    
    if (exports.length > 0) {
      analysis.componentMap[path] = { exports, props: props.length > 0 ? props : undefined };
    }
  }
  
  return analysis;
}

// Format knowledge base for prompt
function formatKnowledgeBase(kb?: KnowledgeBaseContext): string {
  if (!kb) return '';
  
  const sections: string[] = [];
  
  if (kb.instructions?.trim()) {
    sections.push(`CUSTOM INSTRUCTIONS:\n${kb.instructions}`);
  }
  
  if (kb.techStack && kb.techStack.length > 0) {
    const techList = kb.techStack
      .map(t => `- ${t.name}${t.version ? ` v${t.version}` : ''}${t.notes ? ` (${t.notes})` : ''}`)
      .join('\n');
    sections.push(`TECH STACK:\n${techList}`);
  }
  
  if (kb.conventions) {
    const conventions: string[] = [];
    if (kb.conventions.componentNaming) conventions.push(`- Components: ${kb.conventions.componentNaming}`);
    if (kb.conventions.fileNaming) conventions.push(`- Files: ${kb.conventions.fileNaming}`);
    if (kb.conventions.stateManagement) conventions.push(`- State: ${kb.conventions.stateManagement}`);
    if (kb.conventions.styling) conventions.push(`- Styling: ${kb.conventions.styling}`);
    if (kb.conventions.customRules) {
      kb.conventions.customRules.forEach(rule => conventions.push(`- ${rule}`));
    }
    if (conventions.length > 0) {
      sections.push(`CODE CONVENTIONS:\n${conventions.join('\n')}`);
    }
  }
  
  if (kb.contextDocs && kb.contextDocs.length > 0) {
    const docs = kb.contextDocs
      .map(d => `[${d.type.toUpperCase()}: ${d.title}]\n${d.content}`)
      .join('\n\n');
    sections.push(`REFERENCE DOCUMENTS:\n${docs}`);
  }
  
  if (sections.length === 0) return '';
  
  return `
=== PROJECT-SPECIFIC CONTEXT ===

${sections.join('\n\n')}

=== END PROJECT CONTEXT ===
`;
}

// Build context-aware prompt from project analysis
function buildEnhancedPrompt(
  analysis: ProjectAnalysis, 
  files: FileContext[], 
  errors: ErrorContext[],
  conversationHistory: Message[],
  knowledgeBase?: KnowledgeBaseContext
): string {
  // Add knowledge base first
  let contextSummary = formatKnowledgeBase(knowledgeBase);
  
  contextSummary += `
PROJECT STRUCTURE ANALYSIS:
- Entry Points: ${analysis.entryPoints.join(', ') || 'None detected'}
- CSS Files: ${analysis.cssFiles.join(', ') || 'None'}
- Config Files: ${analysis.configFiles.join(', ') || 'None'}

COMPONENT DEPENDENCY MAP:
${Object.entries(analysis.dependencyGraph)
  .slice(0, 10)
  .map(([file, deps]) => `  ${file} imports: ${deps.join(', ')}`)
  .join('\n') || 'No imports detected'}

EXPORTED COMPONENTS:
${Object.entries(analysis.componentMap)
  .slice(0, 10)
  .map(([file, { exports, props }]) => 
    `  ${file}: ${exports.join(', ')}${props ? ` (Props: ${props.join(', ')})` : ''}`
  )
  .join('\n') || 'No exports detected'}
`;

  // Add error context if present
  if (errors.length > 0) {
    contextSummary += `

⚠️ CURRENT ERRORS (${errors.length}):
${errors.map((e, i) => `
${i + 1}. [${e.type.toUpperCase()}] ${e.message}
   ${e.file ? `File: ${e.file}${e.line ? `:${e.line}` : ''}` : ''}
   ${e.stack ? `Stack: ${e.stack.slice(0, 200)}...` : ''}
`).join('\n')}

IMPORTANT: When there are errors present, prioritize fixing them. Explain what caused the error and provide a clear solution.
`;
  }

  // Add conversation context summary
  if (conversationHistory.length > 2) {
    const recentHistory = conversationHistory.slice(-6);
    contextSummary += `

RECENT CONVERSATION CONTEXT (last ${recentHistory.length} messages):
${recentHistory.map(m => `[${m.role.toUpperCase()}]: ${m.content.slice(0, 100)}${m.content.length > 100 ? '...' : ''}`).join('\n')}
`;
  }

  return contextSummary;
}

const SYSTEM_PROMPT = `${AI_TRUST_COVENANT}

${AGENT_COORDINATION_PROTOCOL}

You are an expert React/TypeScript developer assistant with MULTI-FILE REASONING capabilities. You understand project structure, component relationships, and can fix errors intelligently.

Your job is to generate, modify, or delete files based on user requests, understanding how files relate to each other.

IMPORTANT: You must respond with a JSON object containing:
1. "thinking" - Explain your reasoning, including:
   - What files are affected and why
   - How changes impact other components
   - If fixing an error, explain the root cause
2. "operations" - An array of file operations to perform

Each operation must have:
- "type": "create" | "update" | "delete"
- "path": The file path (e.g., "/src/App.tsx")
- "content": The full file content (for create/update only)

MULTI-FILE REASONING RULES:
1. When modifying a component, check if its props interface needs updating
2. When updating exports, ensure all importers are updated
3. When adding new dependencies, add proper imports
4. Maintain consistency with existing code style and patterns
5. Consider the impact on parent/child components

ERROR FIXING RULES:
1. When fixing errors, address the root cause, not just symptoms
2. Explain what caused the error in your thinking
3. If a fix requires changes to multiple files, include all of them
4. After fixing, suggest preventive measures

CODE QUALITY RULES:
- Generate complete, working React code with TypeScript
- Use modern React patterns (hooks, functional components)
- Include proper imports
- Use Tailwind CSS for styling
- Make code clean, readable, and well-structured
- If updating a file, include the COMPLETE new file content
- Always use proper TypeScript types

AI-GENERATED ASSETS:
When users reference AI-generated images or videos:
- Assets are stored in Supabase Storage under 'ai-assets' bucket
- Reference by URL using the storage_url field from generated_assets table
- Videos are MP4 format, images are WebP format

Respond ONLY with valid JSON. No markdown, no code blocks, just the raw JSON object.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, files, errors = [], conversationId, knowledgeBase } = await req.json() as {
      messages: Message[];
      files: FileContext[];
      errors?: ErrorContext[];
      conversationId?: string;
      knowledgeBase?: KnowledgeBaseContext;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Analyze project structure
    const analysis = analyzeProject(files);
    
    // Build enhanced context with knowledge base
    const enhancedContext = buildEnhancedPrompt(analysis, files, errors, messages, knowledgeBase);
    
    // Build file context (limit to key files + related files)
    const fileContext = files.length > 0 
      ? `\n\nCURRENT PROJECT FILES:\n${files.map(f => 
          `--- ${f.path} (${f.language}) ---\n${f.content}\n`
        ).join('\n')}`
      : '';

    const fullSystemPrompt = SYSTEM_PROMPT + '\n' + enhancedContext + fileContext;

    const hasKnowledgeBase = !!(knowledgeBase?.instructions || knowledgeBase?.techStack?.length || knowledgeBase?.contextDocs?.length);
    
    console.log(`[builder-ai-enhanced] Processing request:
      - Files: ${files.length}
      - Errors: ${errors.length}
      - Knowledge Base: ${hasKnowledgeBase ? 'Yes' : 'No'}
      - Conversation ID: ${conversationId || 'none'}
      - Entry points: ${analysis.entryPoints.join(', ')}
      - Components: ${Object.keys(analysis.componentMap).length}
    `);

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
      console.error("[builder-ai-enhanced] AI gateway error:", response.status, errorText);
      
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
    console.error("[builder-ai-enhanced] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
