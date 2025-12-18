import { useState, useEffect, useCallback, useRef } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import { toast } from "sonner";
import type { UploadedFile } from "./useFileUpload";

interface QueuedMessage {
  id: string;
  content: string;
  conversationId: string;
  linkedProject?: { url: string | null; name: string | null };
  attachments?: UploadedFile[];
  timestamp: number;
}

const QUEUE_STORAGE_KEY = "offline_message_queue";

export function useOfflineQueue() {
  const { isOnline, isChecking, retryConnection, markApiSuccess } = useOnlineStatus();
  const [queue, setQueue] = useState<QueuedMessage[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncHandlerRef = useRef<((msg: QueuedMessage) => Promise<void>) | null>(null);
  const wasOfflineRef = useRef(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as QueuedMessage[];
        setQueue(parsed);
      }
    } catch {
      // Invalid stored data, clear it
      localStorage.removeItem(QUEUE_STORAGE_KEY);
    }
  }, []);

  // Persist queue to localStorage
  useEffect(() => {
    if (queue.length > 0) {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } else {
      localStorage.removeItem(QUEUE_STORAGE_KEY);
    }
  }, [queue]);

  // Track offline state for showing reconnection message
  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
    }
  }, [isOnline]);

  // Sync queue when back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && syncHandlerRef.current && !isSyncing) {
      syncQueue();
    }
    
    if (isOnline && wasOfflineRef.current) {
      wasOfflineRef.current = false;
      if (queue.length === 0) {
        toast.success("Back online!");
      }
    }
  }, [isOnline, queue.length, isSyncing]);

  const syncQueue = useCallback(async () => {
    if (!syncHandlerRef.current || queue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    toast.info(`Syncing ${queue.length} queued message${queue.length > 1 ? "s" : ""}...`);

    const failedMessages: QueuedMessage[] = [];

    for (const message of queue) {
      try {
        await syncHandlerRef.current(message);
      } catch (error) {
        console.error("Failed to sync message:", error);
        failedMessages.push(message);
      }
    }

    setQueue(failedMessages);
    setIsSyncing(false);

    if (failedMessages.length === 0) {
      toast.success("All messages synced!");
    } else {
      toast.error(`${failedMessages.length} message${failedMessages.length > 1 ? "s" : ""} failed to sync`);
    }
  }, [queue, isSyncing]);

  const addToQueue = useCallback((
    content: string,
    conversationId: string,
    linkedProject?: { url: string | null; name: string | null },
    attachments?: UploadedFile[]
  ) => {
    const message: QueuedMessage = {
      id: crypto.randomUUID(),
      content,
      conversationId,
      linkedProject,
      attachments,
      timestamp: Date.now(),
    };

    setQueue((prev) => [...prev, message]);
    toast.info("Message queued for when you're back online");

    return message;
  }, []);

  const removeFromQueue = useCallback((messageId: string) => {
    setQueue((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  }, []);

  const setSyncHandler = useCallback((handler: (msg: QueuedMessage) => Promise<void>) => {
    syncHandlerRef.current = handler;
  }, []);

  return {
    isOnline,
    isChecking,
    retryConnection,
    markApiSuccess,
    queue,
    queueLength: queue.length,
    isSyncing,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setSyncHandler,
    syncQueue,
  };
}

export type { QueuedMessage };
