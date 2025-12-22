import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  currentFile?: string;
  cursorPosition?: { line: number; column: number };
  color: string;
  lastActive: string;
}

interface UseEditorPresenceOptions {
  projectId: string;
  enabled?: boolean;
}

const PRESENCE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4',
];

function getRandomColor(): string {
  return PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)];
}

export function useEditorPresence({ projectId, enabled = true }: UseEditorPresenceOptions) {
  const [collaborators, setCollaborators] = useState<PresenceState[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const userColorRef = useRef<string>(getRandomColor());
  const currentUserRef = useRef<{ id: string; displayName: string; avatarUrl?: string } | null>(null);

  // Track current file being edited
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number } | null>(null);

  // Initialize presence channel
  useEffect(() => {
    if (!enabled || !projectId) return;

    let isMounted = true;

    async function setupPresence() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();

      currentUserRef.current = {
        id: user.id,
        displayName: profile?.display_name || user.email?.split('@')[0] || 'Anonymous',
        avatarUrl: profile?.avatar_url || undefined,
      };

      const channel = supabase.channel(`presence:${projectId}`, {
        config: { presence: { key: user.id } },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const users: PresenceState[] = [];
          
          Object.entries(state).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              const rawPresence = value[0] as Record<string, unknown>;
              if (rawPresence.userId && rawPresence.userId !== user.id) {
                users.push({
                  id: String(rawPresence.id || ''),
                  userId: String(rawPresence.userId),
                  displayName: String(rawPresence.displayName || 'Unknown'),
                  avatarUrl: rawPresence.avatarUrl as string | undefined,
                  currentFile: rawPresence.currentFile as string | undefined,
                  cursorPosition: rawPresence.cursorPosition as { line: number; column: number } | undefined,
                  color: String(rawPresence.color || '#3b82f6'),
                  lastActive: String(rawPresence.lastActive || new Date().toISOString()),
                });
              }
            }
          });
          
          setCollaborators(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && isMounted) {
            setIsConnected(true);
            
            // Track presence
            await channel.track({
              id: crypto.randomUUID(),
              userId: user.id,
              displayName: currentUserRef.current?.displayName,
              avatarUrl: currentUserRef.current?.avatarUrl,
              color: userColorRef.current,
              lastActive: new Date().toISOString(),
            });
          }
        });

      channelRef.current = channel;
    }

    setupPresence();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [projectId, enabled]);

  // Update presence when file or cursor changes
  const updatePresence = useCallback(async () => {
    if (!channelRef.current || !currentUserRef.current) return;

    await channelRef.current.track({
      id: crypto.randomUUID(),
      userId: currentUserRef.current.id,
      displayName: currentUserRef.current.displayName,
      avatarUrl: currentUserRef.current.avatarUrl,
      currentFile: currentFile || undefined,
      cursorPosition: cursorPosition || undefined,
      color: userColorRef.current,
      lastActive: new Date().toISOString(),
    });
  }, [currentFile, cursorPosition]);

  // Update presence when file changes
  const trackFileOpen = useCallback((filePath: string) => {
    setCurrentFile(filePath);
  }, []);

  // Update cursor position
  const trackCursor = useCallback((position: { line: number; column: number }) => {
    setCursorPosition(position);
  }, []);

  // Reduced debounce for smoother cursor updates (100ms instead of 500ms)
  useEffect(() => {
    const timeout = setTimeout(updatePresence, 100);
    return () => clearTimeout(timeout);
  }, [currentFile, cursorPosition, updatePresence]);

  // Get collaborators editing the same file
  const getCollaboratorsInFile = useCallback((filePath: string) => {
    return collaborators.filter(c => c.currentFile === filePath);
  }, [collaborators]);

  return {
    collaborators,
    isConnected,
    userColor: userColorRef.current,
    trackFileOpen,
    trackCursor,
    getCollaboratorsInFile,
    currentFile,
  };
}