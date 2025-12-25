import { useState, useCallback, useRef } from 'react';
import type { ProjectFile } from '@/types/builder';
import type { CapturedError } from '@/components/builder/ErrorCapture';
import {
  DEFAULT_AGENT_CONFIG,
  type AgentSession,
  type AgentStep,
  type AgentStatus,
  type AgentToolCall,
  type AgentToolResult,
  type AgentMessage,
  type FileOperation,
  type SearchResult,
  type FileListItem,
  type AgentConfig,
  type StreamingToolCall,
} from '@/types/agent';

interface UseAgentModeOptions {
  projectId: string;
  files: ProjectFile[];
  errors: CapturedError[];
  onApplyOperations: (operations: FileOperation[]) => Promise<void>;
  onSessionComplete?: (session: AgentSession) => void;
  config?: Partial<AgentConfig>;
}

interface UseAgentModeReturn {
  session: AgentSession | null;
  isRunning: boolean;
  messages: AgentMessage[];
  runAgent: (request: string) => Promise<void>;
  cancelAgent: () => void;
  applyPendingOperations: () => Promise<void>;
  clearSession: () => void;
}

export function useAgentMode({
  projectId,
  files,
  errors,
  onApplyOperations,
  onSessionComplete,
  config: userConfig,
}: UseAgentModeOptions): UseAgentModeReturn {
  const config: AgentConfig = { ...DEFAULT_AGENT_CONFIG, ...userConfig };
  
  const [session, setSession] = useState<AgentSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Tool implementations
  const executeReadFile = useCallback((path: string): string | null => {
    const file = files.find(f => f.path === path);
    return file?.content || null;
  }, [files]);

  const executeSearchFiles = useCallback((
    query: string,
    filePattern?: string,
    maxResults = 20
  ): SearchResult[] => {
    const results: SearchResult[] = [];
    
    for (const file of files) {
      if (filePattern && !file.path.match(new RegExp(filePattern.replace('*', '.*')))) {
        continue;
      }
      
      if (!file.content) continue;
      
      const lines = file.content.split('\n');
      const matches: SearchResult['matches'] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const matchIndex = line.toLowerCase().indexOf(query.toLowerCase());
        if (matchIndex !== -1) {
          matches.push({
            line: i + 1,
            content: line.trim(),
            matchStart: matchIndex,
            matchEnd: matchIndex + query.length,
          });
        }
      }
      
      if (matches.length > 0) {
        results.push({ path: file.path, matches });
      }
      
      if (results.length >= maxResults) break;
    }
    
    return results;
  }, [files]);

  const executeListFiles = useCallback((
    pattern?: string,
    directory?: string
  ): FileListItem[] => {
    let filtered = files;
    
    if (directory) {
      filtered = filtered.filter(f => f.path.startsWith(directory));
    }
    
    if (pattern) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      filtered = filtered.filter(f => regex.test(f.path));
    }
    
    return filtered.map(f => ({
      path: f.path,
      type: f.type,
      name: f.name,
    }));
  }, [files]);

  const executeGetErrors = useCallback((): CapturedError[] => {
    return errors;
  }, [errors]);

  // Execute a tool call
  const executeTool = useCallback(async (
    toolCall: AgentToolCall
  ): Promise<AgentToolResult> => {
    const args = toolCall.arguments;
    
    try {
      switch (toolCall.name) {
        case 'read_file': {
          const content = executeReadFile(args.path as string);
          if (content === null) {
            return {
              toolCallId: toolCall.id,
              tool: toolCall.name,
              success: false,
              error: `File not found: ${args.path}`,
            };
          }
          return {
            toolCallId: toolCall.id,
            tool: toolCall.name,
            success: true,
            data: { path: args.path, content },
          };
        }
        
        case 'search_files': {
          const results = executeSearchFiles(
            args.query as string,
            args.filePattern as string | undefined,
            args.maxResults as number | undefined
          );
          return {
            toolCallId: toolCall.id,
            tool: toolCall.name,
            success: true,
            data: { query: args.query, results },
          };
        }
        
        case 'list_files': {
          const fileList = executeListFiles(
            args.pattern as string | undefined,
            args.directory as string | undefined
          );
          return {
            toolCallId: toolCall.id,
            tool: toolCall.name,
            success: true,
            data: { files: fileList },
          };
        }
        
        case 'apply_changes': {
          const operations = args.operations as FileOperation[];
          // Don't apply immediately - store as pending
          return {
            toolCallId: toolCall.id,
            tool: toolCall.name,
            success: true,
            data: { 
              pendingOperations: operations,
              explanation: args.explanation,
            },
          };
        }
        
        case 'get_errors': {
          const currentErrors = executeGetErrors();
          return {
            toolCallId: toolCall.id,
            tool: toolCall.name,
            success: true,
            data: { errors: currentErrors },
          };
        }
        
        default:
          return {
            toolCallId: toolCall.id,
            tool: toolCall.name,
            success: false,
            error: `Unknown tool: ${toolCall.name}`,
          };
      }
    } catch (error) {
      return {
        toolCallId: toolCall.id,
        tool: toolCall.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, [executeReadFile, executeSearchFiles, executeListFiles, executeGetErrors]);

  // Add a step to the session
  const addStep = useCallback((
    type: AgentStep['type'],
    description: string,
    status: AgentStep['status'] = 'running'
  ): string => {
    const stepId = crypto.randomUUID();
    const step: AgentStep = {
      id: stepId,
      type,
      status,
      description,
      timestamp: new Date(),
    };
    
    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: [...prev.steps, step],
        currentStepIndex: prev.steps.length,
      };
    });
    
    return stepId;
  }, []);

  // Update a step
  const updateStep = useCallback((
    stepId: string,
    updates: Partial<AgentStep>
  ) => {
    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map(s => 
          s.id === stepId 
            ? { ...s, ...updates, duration: updates.status === 'complete' 
                ? Date.now() - s.timestamp.getTime() 
                : s.duration 
              }
            : s
        ),
      };
    });
  }, []);

  // Update session status
  const updateStatus = useCallback((status: AgentStatus) => {
    setSession(prev => {
      if (!prev) return prev;
      return { ...prev, status };
    });
  }, []);

  // Parse streaming SSE response
  const parseStreamResponse = async (
    response: Response,
    onContent: (content: string) => void,
    onToolCalls: (toolCalls: AgentToolCall[]) => void,
    signal: AbortSignal
  ) => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');
    
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let toolCalls: StreamingToolCall[] = [];
    
    try {
      while (true) {
        if (signal.aborted) break;
        
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith(':') || !line.trim()) continue;
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const choice = parsed.choices?.[0];
            
            if (choice?.delta?.content) {
              fullContent += choice.delta.content;
              onContent(fullContent);
            }
            
            if (choice?.delta?.tool_calls) {
              for (const tc of choice.delta.tool_calls) {
                const existing = toolCalls.find(t => t.id === tc.id);
                if (existing) {
                  if (tc.function?.arguments) {
                    existing._argsBuffer = (existing._argsBuffer || '') + tc.function.arguments;
                  }
                } else if (tc.id) {
                  toolCalls.push({
                    id: tc.id,
                    name: tc.function?.name || '',
                    arguments: {},
                    _argsBuffer: tc.function?.arguments || '',
                  });
                }
              }
            }
            
            if (choice?.finish_reason === 'tool_calls' || choice?.finish_reason === 'stop') {
              // Parse accumulated arguments and convert to AgentToolCall
              const parsedToolCalls: AgentToolCall[] = toolCalls.map(tc => ({
                id: tc.id,
                name: tc.name,
                arguments: tc._argsBuffer ? JSON.parse(tc._argsBuffer) : {},
              }));
              onToolCalls(parsedToolCalls);
            }
          } catch (e) {
            // Ignore JSON parse errors for partial chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    return { content: fullContent, toolCalls };
  };

  // Main agent loop
  const runAgent = useCallback(async (request: string) => {
    if (isRunning) return;
    
    setIsRunning(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    // Initialize session
    const sessionId = crypto.randomUUID();
    const newSession: AgentSession = {
      id: sessionId,
      status: 'planning',
      steps: [],
      currentStepIndex: -1,
      maxIterations: config.maxIterations,
      iterationCount: 0,
      originalRequest: request,
      pendingOperations: [],
      appliedOperations: [],
      errors: [],
      startTime: new Date(),
    };
    setSession(newSession);
    
    // Add user message
    const userMessage: AgentMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: request,
      timestamp: new Date(),
    };
    setMessages([userMessage]);
    
    const conversationHistory: AgentMessage[] = [userMessage];
    let iterationCount = 0;
    let pendingOps: FileOperation[] = [];
    
    try {
      while (iterationCount < config.maxIterations && !signal.aborted) {
        iterationCount++;
        setSession(prev => prev ? { ...prev, iterationCount, status: 'executing' } : prev);
        
        const thinkStepId = addStep('think', `Iteration ${iterationCount}: Analyzing...`);
        
        // Call the agent API
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-ai`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              messages: conversationHistory.map(m => ({
                role: m.role,
                content: m.content,
                tool_calls: m.toolCalls,
                tool_call_id: m.toolCallId,
              })),
              files: files.map(f => ({
                path: f.path,
                content: f.content || '',
                type: f.type,
              })),
              errors: errors.map(e => ({
                message: e.message,
                file: e.file,
                line: e.line,
                stack: e.stack,
              })),
              iterationCount,
              maxIterations: config.maxIterations,
            }),
            signal,
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Agent API error');
        }
        
        let assistantContent = '';
        let toolCalls: AgentToolCall[] = [];
        
        await parseStreamResponse(
          response,
          (content) => {
            assistantContent = content;
            setSession(prev => prev ? { ...prev, thinking: content } : prev);
          },
          (calls) => {
            toolCalls = calls;
          },
          signal
        );
        
        updateStep(thinkStepId, { status: 'complete', detail: assistantContent.slice(0, 100) });
        
        // Add assistant message
        const assistantMessage: AgentMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: assistantContent,
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          timestamp: new Date(),
        };
        conversationHistory.push(assistantMessage);
        setMessages(prev => [...prev, assistantMessage]);
        
        // Check if agent is complete
        if (assistantContent.includes('AGENT_COMPLETE') || toolCalls.length === 0) {
          updateStatus('complete');
          break;
        }
        
        // Execute tool calls
        for (const toolCall of toolCalls) {
          if (signal.aborted) break;
          
          const stepId = addStep(
            toolCall.name as AgentStep['type'],
            `${toolCall.name}: ${JSON.stringify(toolCall.arguments).slice(0, 50)}...`
          );
          
          const result = await executeTool(toolCall);
          
          updateStep(stepId, {
            status: result.success ? 'complete' : 'error',
            result: result.data,
            detail: result.error,
          });
          
          // Handle apply_changes specially
          if (toolCall.name === 'apply_changes' && result.success) {
            const data = result.data as { pendingOperations: FileOperation[] };
            pendingOps = [...pendingOps, ...data.pendingOperations];
            setSession(prev => prev ? { 
              ...prev, 
              pendingOperations: pendingOps,
              status: 'applying',
            } : prev);
            
            // Auto-apply if configured
            if (config.autoApply) {
              await onApplyOperations(data.pendingOperations);
              setSession(prev => prev ? {
                ...prev,
                appliedOperations: [...prev.appliedOperations, ...data.pendingOperations],
                pendingOperations: prev.pendingOperations.filter(
                  op => !data.pendingOperations.some(p => p.path === op.path)
                ),
              } : prev);
            }
          }
          
          // Add tool result to conversation
          const toolMessage: AgentMessage = {
            id: crypto.randomUUID(),
            role: 'tool',
            content: JSON.stringify(result.data || result.error),
            toolCallId: toolCall.id,
            timestamp: new Date(),
          };
          conversationHistory.push(toolMessage);
        }
      }
      
      // Final status and save to history
      if (!signal.aborted) {
        const finalStatus = pendingOps.length > 0 ? 'applying' : 'complete';
        const endTime = new Date();
        
        setSession(prev => {
          if (!prev) return prev;
          const completedSession = {
            ...prev,
            status: finalStatus as AgentStatus,
            endTime,
          };
          // Save to history
          onSessionComplete?.(completedSession);
          return completedSession;
        });
      }
      
    } catch (error) {
      if (!signal.aborted) {
        console.error('Agent error:', error);
        const endTime = new Date();
        
        setSession(prev => {
          if (!prev) return prev;
          const errorSession = {
            ...prev,
            status: 'error' as AgentStatus,
            endTime,
          };
          // Save error sessions to history too
          onSessionComplete?.(errorSession);
          return errorSession;
        });
        addStep('fix_error', error instanceof Error ? error.message : 'Unknown error', 'error');
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  }, [
    isRunning, 
    config, 
    files, 
    errors, 
    addStep, 
    updateStep, 
    updateStatus, 
    executeTool,
    onApplyOperations,
    onSessionComplete,
  ]);

  const cancelAgent = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsRunning(false);
    updateStatus('idle');
  }, [updateStatus]);

  const applyPendingOperations = useCallback(async () => {
    if (!session?.pendingOperations.length) return;
    
    await onApplyOperations(session.pendingOperations);
    
    setSession(prev => prev ? {
      ...prev,
      appliedOperations: [...prev.appliedOperations, ...prev.pendingOperations],
      pendingOperations: [],
      status: 'complete',
    } : prev);
  }, [session, onApplyOperations]);

  const clearSession = useCallback(() => {
    setSession(null);
    setMessages([]);
    setIsRunning(false);
  }, []);

  return {
    session,
    isRunning,
    messages,
    runAgent,
    cancelAgent,
    applyPendingOperations,
    clearSession,
  };
}
