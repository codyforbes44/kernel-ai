/**
 * Agent Coordination Protocol
 * 
 * Defines how multiple AI agents work together seamlessly to serve the user.
 * This protocol ensures consistent behavior, proper context handoffs, and
 * unified communication across all AI touchpoints.
 * 
 * @version 1.0.0
 * @lastUpdated 2025-01-01
 */

/**
 * Multi-Agent Coordination Protocol - Rules for agent collaboration
 */
export const AGENT_COORDINATION_PROTOCOL = `
## MULTI-AGENT COORDINATION PROTOCOL

When working alongside other AI agents, I follow these coordination principles:

### 1. CONTEXT SHARING
- Pass all relevant context to downstream agents
- Preserve user preferences, project state, and conversation history
- Include error context, success criteria, and constraints
- Never assume another agent knows what happened previously

### 2. NO CONTRADICTIONS
- Maintain consistency with outputs from prior agents
- If a previous agent made an error, correct it gracefully without blame
- Build upon rather than replace previous work
- When perspectives differ, explain the reasoning for any changes

### 3. GRACEFUL HANDOFFS
- Clearly indicate when another agent is better suited for a task
- Provide comprehensive handoff context
- Summarize what has been accomplished and what remains
- Never abandon a user mid-task without proper transition

### 4. UNIFIED VOICE
- Speak with consistent personality and values
- Use the same terminology and conventions
- Maintain the same quality standards across all interactions
- Present as a cohesive team, not separate systems

### 5. ERROR ACKNOWLEDGMENT
- If a sibling agent made an error, correct it without dwelling on blame
- Take ownership of the overall user experience
- Learn from cross-agent errors to prevent recurrence
- Always prioritize resolution over attribution

### 6. PROGRESS TRACKING
- Maintain awareness of the overall task state
- Track what has been accomplished across all agents
- Ensure no steps are missed or duplicated
- Provide clear status updates when resuming work
`;

/**
 * Agent roles and their specializations
 */
export interface AgentRole {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  handoffTriggers: string[];
}

export const AGENT_ROLES: AgentRole[] = [
  {
    id: 'voice_agent',
    name: 'Voice Agent',
    description: 'Handles voice-based interactions and conversational guidance',
    capabilities: [
      'Natural language voice conversations',
      'Platform guidance and navigation',
      'Feature explanations',
      'Quick answers and help',
      'AI Studio guidance'
    ],
    handoffTriggers: [
      'Complex code generation needed',
      'Database operations required',
      'File system operations needed',
      'User requests text-based interaction'
    ]
  },
  {
    id: 'chat_agent',
    name: 'Chat Agent',
    description: 'Handles text-based conversations and project discussions',
    capabilities: [
      'Project planning and architecture',
      'Feature discussions',
      'Code explanations',
      'Troubleshooting guidance',
      'Knowledge base queries'
    ],
    handoffTriggers: [
      'User requests code changes',
      'Database schema modifications needed',
      'Complex file operations required',
      'User wants voice interaction'
    ]
  },
  {
    id: 'code_agent',
    name: 'Code Agent',
    description: 'Handles code generation, modifications, and file operations',
    capabilities: [
      'Code generation and modification',
      'File reading and writing',
      'Error analysis and fixing',
      'Refactoring and optimization',
      'Multi-file operations'
    ],
    handoffTriggers: [
      'User has follow-up questions',
      'User wants to discuss alternatives',
      'Voice guidance requested'
    ]
  },
  {
    id: 'builder_agent',
    name: 'Builder Agent',
    description: 'Handles enhanced code generation with project context',
    capabilities: [
      'Context-aware code generation',
      'Project structure analysis',
      'Component creation with conventions',
      'Error-aware modifications'
    ],
    handoffTriggers: [
      'Simple explanations needed',
      'User wants discussion mode',
      'Voice interaction preferred'
    ]
  },
  {
    id: 'asset_agent',
    name: 'Asset Generation Agent',
    description: 'Handles AI-powered image and video generation',
    capabilities: [
      'Image generation (Flux, SDXL, Gemini)',
      'Video generation (Luma, Kling, MiniMax)',
      'ControlNet guided generation',
      'Image upscaling',
      'Screenshot to code conversion'
    ],
    handoffTriggers: [
      'User wants to use assets in code',
      'Non-asset related questions',
      'Code integration needed'
    ]
  }
];

/**
 * Context that should be shared between agents
 */
export interface SharedAgentContext {
  userId?: string;
  projectId?: string;
  projectName?: string;
  conversationId?: string;
  currentTask?: string;
  completedSteps?: string[];
  pendingSteps?: string[];
  errors?: string[];
  userPreferences?: Record<string, unknown>;
  lastAgentId?: string;
  handoffReason?: string;
}

/**
 * Format shared context for agent handoff
 */
export function formatHandoffContext(context: SharedAgentContext): string {
  const parts: string[] = [];
  
  if (context.projectName) {
    parts.push(`Project: ${context.projectName}`);
  }
  
  if (context.currentTask) {
    parts.push(`Current Task: ${context.currentTask}`);
  }
  
  if (context.completedSteps?.length) {
    parts.push(`Completed: ${context.completedSteps.join(', ')}`);
  }
  
  if (context.pendingSteps?.length) {
    parts.push(`Pending: ${context.pendingSteps.join(', ')}`);
  }
  
  if (context.errors?.length) {
    parts.push(`Errors to address: ${context.errors.join('; ')}`);
  }
  
  if (context.lastAgentId && context.handoffReason) {
    parts.push(`Handoff from ${context.lastAgentId}: ${context.handoffReason}`);
  }
  
  return parts.join('\n');
}

/**
 * Get agent by ID
 */
export function getAgentRole(id: string): AgentRole | undefined {
  return AGENT_ROLES.find(a => a.id === id);
}

/**
 * Determine the best agent for a given task
 */
export function suggestAgentForTask(task: string): AgentRole {
  const taskLower = task.toLowerCase();
  
  // Check for voice-related tasks
  if (taskLower.includes('voice') || taskLower.includes('speak') || taskLower.includes('talk')) {
    return AGENT_ROLES.find(a => a.id === 'voice_agent')!;
  }
  
  // Check for asset generation tasks
  if (
    taskLower.includes('image') || 
    taskLower.includes('video') || 
    taskLower.includes('generate') ||
    taskLower.includes('upscale') ||
    taskLower.includes('controlnet')
  ) {
    return AGENT_ROLES.find(a => a.id === 'asset_agent')!;
  }
  
  // Check for code tasks
  if (
    taskLower.includes('code') || 
    taskLower.includes('file') || 
    taskLower.includes('create') ||
    taskLower.includes('modify') ||
    taskLower.includes('fix')
  ) {
    return AGENT_ROLES.find(a => a.id === 'code_agent')!;
  }
  
  // Default to chat agent for discussions
  return AGENT_ROLES.find(a => a.id === 'chat_agent')!;
}

/**
 * Team commitment statement for unified AI response
 */
export const TEAM_COMMITMENT = `
As part of the Kernel AI team, I work alongside other specialized AI agents to provide you with the best possible experience. We share context, maintain consistency, and always put your success first. Whether you're talking to me or any other agent, you're getting the same commitment to quality, honesty, and helpfulness.
`;
