import type { ProjectFile } from './builder';
import type { CapturedError } from '@/components/builder/ErrorCapture';

export type AgentStatus = 
  | 'idle' 
  | 'planning' 
  | 'executing' 
  | 'applying' 
  | 'verifying' 
  | 'correcting' 
  | 'complete' 
  | 'error';

export type AgentStepType = 
  | 'think' 
  | 'read_file' 
  | 'search_files' 
  | 'list_files'
  | 'apply_changes' 
  | 'verify' 
  | 'fix_error';

export type AgentStepStatus = 'pending' | 'running' | 'complete' | 'error';

export interface AgentStep {
  id: string;
  type: AgentStepType;
  status: AgentStepStatus;
  description: string;
  detail?: string;
  timestamp: Date;
  duration?: number;
  result?: unknown;
}

export type AgentToolName = 
  | 'read_file' 
  | 'search_files' 
  | 'list_files' 
  | 'apply_changes' 
  | 'get_errors';

export interface AgentToolCall {
  id: string;
  name: AgentToolName;
  arguments: Record<string, unknown>;
}

// Internal type for streaming tool call accumulation
export interface StreamingToolCall extends AgentToolCall {
  _argsBuffer?: string;
}

export interface AgentToolResult {
  toolCallId: string;
  tool: AgentToolName;
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface FileOperation {
  type: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
  reason?: string;
}

export interface AgentSession {
  id: string;
  status: AgentStatus;
  steps: AgentStep[];
  currentStepIndex: number;
  maxIterations: number;
  iterationCount: number;
  originalRequest: string;
  pendingOperations: FileOperation[];
  appliedOperations: FileOperation[];
  errors: CapturedError[];
  thinking?: string;
  startTime: Date;
  endTime?: Date;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: AgentToolCall[];
  toolCallId?: string;
  timestamp: Date;
}

export interface AgentContext {
  files: ProjectFile[];
  errors: CapturedError[];
  recentChanges: FileOperation[];
  conversationHistory: AgentMessage[];
}

export interface SearchResult {
  path: string;
  matches: Array<{
    line: number;
    content: string;
    matchStart: number;
    matchEnd: number;
  }>;
}

export interface FileListItem {
  path: string;
  type: string;
  name: string;
}

// Tool parameter types
export interface ReadFileParams {
  path: string;
}

export interface SearchFilesParams {
  query: string;
  filePattern?: string;
  maxResults?: number;
}

export interface ListFilesParams {
  pattern?: string;
  directory?: string;
}

export interface ApplyChangesParams {
  operations: FileOperation[];
  explanation: string;
}

// Agent configuration
export interface AgentConfig {
  maxIterations: number;
  autoApply: boolean;
  verboseLogging: boolean;
  streamResponses: boolean;
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  maxIterations: 5,
  autoApply: false,
  verboseLogging: true,
  streamResponses: true,
};
