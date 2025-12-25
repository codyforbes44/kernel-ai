// ============================================================
// Shared Prompt Architecture for Kernel AI
// ============================================================
// This module provides unified prompts, formatting helpers,
// and quality rules used across all AI functions.
// ============================================================

import { AI_TRUST_COVENANT } from './ai-trust-agreement.ts';
import { AGENT_COORDINATION_PROTOCOL } from './agent-coordination.ts';

/**
 * Core identity shared across all AI functions
 * Includes the AI Trust Covenant as the foundation
 */
export const CORE_IDENTITY = `${AI_TRUST_COVENANT}

You are Kernel AI, an expert development assistant designed to help developers build modern web applications faster.

Your expertise includes:
- React, TypeScript, and Next.js with modern patterns (hooks, server components)
- Tailwind CSS and Shadcn/UI component library
- Supabase (PostgreSQL, Auth, Edge Functions, Storage, Realtime)
- State management (React Query, Zustand, Context)
- Testing (Vitest, React Testing Library)
- Build tools (Vite, Webpack)
- Git workflows and CI/CD

## AI Studio Capabilities
- AI Image Generation (Gemini, Flux Pro/Dev/Schnell, SDXL)
- AI Video Generation (Luma Dream Machine, Kling, MiniMax, Stable Video Diffusion)
- ControlNet for guided image generation (Pose, Depth, Canny, Scribble, SoftEdge)
- Image Upscaling with Real-ESRGAN (2x, 4x)
- Screenshot to Code conversion`;

/**
 * Code quality rules that should be enforced
 */
export const CODE_QUALITY_RULES = `
## Code Quality Standards

1. **TypeScript**: Use proper types, avoid 'any'. Prefer interfaces over type aliases for objects.
2. **Components**: Keep components small (<100 lines), single responsibility. Extract reusable logic into hooks.
3. **Imports**: Use absolute imports with @/ prefix. Group imports (react, external, internal, types).
4. **Naming**: PascalCase for components, camelCase for functions/variables, SCREAMING_SNAKE for constants.
5. **Error Handling**: Always handle errors gracefully. Use try-catch with proper error messages.
6. **Accessibility**: Include aria labels, proper heading hierarchy, keyboard navigation.
7. **Performance**: Memoize expensive computations. Use React.memo for pure components. Lazy load routes.
8. **Security**: Never expose secrets. Validate inputs. Use parameterized queries.`;

/**
 * Response formatting guidelines
 */
export const RESPONSE_FORMAT = `
## Response Guidelines

- Be concise and direct. Developers appreciate efficiency.
- When showing code, always specify the language for syntax highlighting.
- Use markdown formatting for structure (headers, lists, code blocks).
- For multi-file changes, clearly indicate each file path.
- Explain your reasoning briefly, but prioritize actionable code.
- If something is unclear, ask clarifying questions.`;

/**
 * Knowledge Base context interface
 */
export interface KnowledgeBaseContext {
  instructions?: string;
  techStack?: Array<{
    name: string;
    version?: string;
    notes?: string;
  }>;
  conventions?: {
    componentNaming?: string;
    fileNaming?: string;
    stateManagement?: string;
    styling?: string;
    customRules?: string[];
  };
  contextDocs?: Array<{
    title: string;
    content: string;
    type: 'reference' | 'example' | 'api-doc';
  }>;
}

/**
 * Project context for chat sessions
 */
export interface ProjectContext {
  url?: string;
  name?: string;
  knowledgeBase?: KnowledgeBaseContext;
}

/**
 * Format knowledge base into a prompt section
 */
export function formatKnowledgeBase(kb: KnowledgeBaseContext): string {
  const sections: string[] = [];

  if (kb.instructions?.trim()) {
    sections.push(`## Custom Instructions\n${kb.instructions.trim()}`);
  }

  if (kb.techStack && kb.techStack.length > 0) {
    const techList = kb.techStack
      .map(t => `- ${t.name}${t.version ? ` v${t.version}` : ''}${t.notes ? ` (${t.notes})` : ''}`)
      .join('\n');
    sections.push(`## Tech Stack\n${techList}`);
  }

  if (kb.conventions) {
    const conventions: string[] = [];
    if (kb.conventions.componentNaming) conventions.push(`- Components: ${kb.conventions.componentNaming}`);
    if (kb.conventions.fileNaming) conventions.push(`- Files: ${kb.conventions.fileNaming}`);
    if (kb.conventions.stateManagement) conventions.push(`- State Management: ${kb.conventions.stateManagement}`);
    if (kb.conventions.styling) conventions.push(`- Styling: ${kb.conventions.styling}`);
    if (kb.conventions.customRules?.length) {
      kb.conventions.customRules.forEach(rule => conventions.push(`- ${rule}`));
    }
    if (conventions.length > 0) {
      sections.push(`## Code Conventions\n${conventions.join('\n')}`);
    }
  }

  if (kb.contextDocs && kb.contextDocs.length > 0) {
    const docs = kb.contextDocs
      .map(d => `### ${d.type.toUpperCase()}: ${d.title}\n${d.content}`)
      .join('\n\n');
    sections.push(`## Reference Documents\n${docs}`);
  }

  if (sections.length === 0) {
    return '';
  }

  return `
=== PROJECT-SPECIFIC CONTEXT ===

${sections.join('\n\n')}

=== END PROJECT CONTEXT ===
`;
}

/**
 * Format project context for system prompt
 */
export function formatProjectContext(ctx: ProjectContext): string {
  let result = '';

  if (ctx.url && ctx.name) {
    result += `\n\nThe user is working on project "${ctx.name}".
Project URL: ${ctx.url}`;
  }

  if (ctx.knowledgeBase) {
    const kbContext = formatKnowledgeBase(ctx.knowledgeBase);
    if (kbContext) {
      result += `\n\n${kbContext}`;
    }
  }

  return result;
}

/**
 * Build the chat system prompt
 */
export function buildChatSystemPrompt(projectContext?: ProjectContext): string {
  let prompt = `${CORE_IDENTITY}

${RESPONSE_FORMAT}`;

  if (projectContext) {
    prompt += formatProjectContext(projectContext);
  }

  return prompt;
}

/**
 * Build the agent system prompt
 */
export function buildAgentSystemPrompt(projectContext?: ProjectContext): string {
  let prompt = `You are an AI Agent with multi-step reasoning capabilities for code generation and modification. You work autonomously to understand codebases and make changes.

${CORE_IDENTITY}

${AGENT_COORDINATION_PROTOCOL}

${CODE_QUALITY_RULES}

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

  if (projectContext) {
    prompt += formatProjectContext(projectContext);
  }

  return prompt;
}

/**
 * Build the screenshot-to-code system prompt
 */
export function buildScreenshotToCodePrompt(conventions?: KnowledgeBaseContext['conventions']): string {
  let prompt = `You are an expert frontend developer specializing in React and Tailwind CSS.
Your task is to convert screenshots or UI descriptions into clean, production-ready React components.

${CODE_QUALITY_RULES}

## Guidelines

1. Use modern React with TypeScript and functional components
2. Use Tailwind CSS for all styling - no inline styles or CSS files
3. Make components responsive by default
4. Use semantic HTML elements
5. Include proper accessibility attributes (aria-labels, alt text)
6. Use lucide-react for any icons needed
7. Make the code self-contained and ready to use
8. Match the visual design as closely as possible
9. Use appropriate Tailwind color classes that work with dark/light themes`;

  if (conventions) {
    prompt += `\n\n## Project Styling Conventions`;
    if (conventions.styling) prompt += `\n- Styling: ${conventions.styling}`;
    if (conventions.componentNaming) prompt += `\n- Component Naming: ${conventions.componentNaming}`;
    if (conventions.customRules?.length) {
      conventions.customRules.forEach(rule => {
        prompt += `\n- ${rule}`;
      });
    }
  }

  prompt += `\n
## Output Format

- Return ONLY the React component code
- Include all necessary imports at the top
- Export the component as default
- Add brief comments for complex logic`;

  return prompt;
}

/**
 * Default prompt templates that should be seeded for new users
 */
export const DEFAULT_TEMPLATES = [
  {
    name: 'Debug Error',
    description: 'Analyze and fix error messages',
    content: `I'm encountering this error in my Lovable project:

\`\`\`
{{error_message}}
\`\`\`

Context: {{context}}

Please help me understand what's causing this and how to fix it.`,
    category: 'debug' as const,
    variables: ['error_message', 'context'],
  },
  {
    name: 'Component Generator',
    description: 'Generate a new React component',
    content: `Create a {{component_type}} component called {{component_name}} with the following requirements:

- {{requirements}}

Use TypeScript, Tailwind CSS, and follow Shadcn patterns.`,
    category: 'component' as const,
    variables: ['component_type', 'component_name', 'requirements'],
  },
  {
    name: 'Database Schema',
    description: 'Design database tables',
    content: `I need to create a database schema for {{feature_name}}.

Requirements:
{{requirements}}

Please provide the SQL migration with RLS policies.`,
    category: 'database' as const,
    variables: ['feature_name', 'requirements'],
  },
  {
    name: 'Edge Function',
    description: 'Create a Supabase Edge Function',
    content: `Create an Edge Function called {{function_name}} that:

{{requirements}}

Include proper error handling and CORS headers.`,
    category: 'edge_function' as const,
    variables: ['function_name', 'requirements'],
  },
  {
    name: 'RLS Policy Review',
    description: 'Review Row Level Security',
    content: `Review the RLS policies for the {{table_name}} table:

\`\`\`sql
{{current_policies}}
\`\`\`

Ensure they properly protect data while allowing necessary access.`,
    category: 'rls' as const,
    variables: ['table_name', 'current_policies'],
  },
  {
    name: 'Performance Optimization',
    description: 'Optimize component performance',
    content: `Optimize this component for better performance:

\`\`\`tsx
{{component_code}}
\`\`\`

Focus on: memoization, avoiding re-renders, and bundle size.`,
    category: 'performance' as const,
    variables: ['component_code'],
  },
  {
    name: 'UI/UX Improvement',
    description: 'Improve user interface',
    content: `Improve the UI/UX of {{feature_name}}:

Current issues: {{issues}}

Desired outcome: {{desired_outcome}}`,
    category: 'ui_ux' as const,
    variables: ['feature_name', 'issues', 'desired_outcome'],
  },
  {
    name: 'Refactoring Request',
    description: 'Refactor existing code',
    content: `Refactor this code to be more maintainable:

\`\`\`tsx
{{code}}
\`\`\`

Goals: {{goals}}`,
    category: 'refactor' as const,
    variables: ['code', 'goals'],
  },
  {
    name: 'Documentation Generator',
    description: 'Generate documentation',
    content: `Generate documentation for {{component_or_feature}}:

\`\`\`tsx
{{code}}
\`\`\`

Include: usage examples, props, and best practices.`,
    category: 'docs' as const,
    variables: ['component_or_feature', 'code'],
  },
  {
    name: 'Form with Validation',
    description: 'Create a form with React Hook Form and Zod',
    content: `Create a form for {{form_purpose}} with the following fields:

{{fields}}

Use React Hook Form with Zod validation. Include:
- Proper error messages
- Loading states
- Success/error toasts
- Accessible form labels`,
    category: 'component' as const,
    variables: ['form_purpose', 'fields'],
  },
];
