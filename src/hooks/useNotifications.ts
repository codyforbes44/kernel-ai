import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface NotificationCounts {
  chat: number;
  builder: number;
  settings: number;
  admin: number;
}

export function useNotifications() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>({
    chat: 0,
    builder: 0,
    settings: 0,
    admin: 0,
  });

  const fetchUnreadMessages = useCallback(async () => {
    if (!user) return;

    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("role", "assistant")
      .eq("is_read", false);

    if (!error) {
      setCounts((prev) => ({ ...prev, chat: count || 0 }));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchUnreadMessages();

    // Subscribe to new messages for real-time updates
    const channel = supabase
      .channel("notification-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          // Only count new assistant messages as unread
          if (payload.new && payload.new.role === "assistant" && payload.new.user_id === user.id) {
            setCounts((prev) => ({ ...prev, chat: prev.chat + 1 }));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        () => {
          // Refetch when messages are marked as read
          fetchUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadMessages]);

  const clearNotification = useCallback((tab: keyof NotificationCounts) => {
    setCounts((prev) => ({ ...prev, [tab]: 0 }));
  }, []);

  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("conversation_id", conversationId)
      .eq("is_read", false);

    fetchUnreadMessages();
  }, [user, fetchUnreadMessages]);

  return { counts, clearNotification, markMessagesAsRead, refetch: fetchUnreadMessages };
}
