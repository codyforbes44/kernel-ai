import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Profile, Conversation, Message } from '@/types/database';

interface UserWithStats extends Profile {
  email?: string;
  conversation_count?: number;
  message_count?: number;
  last_active?: string;
}

interface ConversationWithUser extends Conversation {
  user_email?: string;
  user_name?: string;
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data && !error);
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    if (!isAdmin) return;

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    // Get conversation and message counts for each user
    const usersWithStats = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { count: convCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        const { count: msgCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        const { data: lastConv } = await supabase
          .from('conversations')
          .select('updated_at')
          .eq('user_id', profile.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...profile,
          conversation_count: convCount || 0,
          message_count: msgCount || 0,
          last_active: lastConv?.updated_at || profile.updated_at,
        } as UserWithStats;
      })
    );

    setUsers(usersWithStats);
  };

  const fetchAllConversations = async () => {
    if (!isAdmin) return;

    const { data: convs, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    // Get user info for each conversation
    const convsWithUser = await Promise.all(
      (convs || []).map(async (conv) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', conv.user_id)
          .single();

        return {
          ...conv,
          user_name: profile?.display_name || 'Unknown',
        } as ConversationWithUser;
      })
    );

    setConversations(convsWithUser);
  };

  const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
    if (!isAdmin) return [];

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return (data || []) as Message[];
  };

  return {
    isAdmin,
    loading,
    users,
    conversations,
    fetchAllUsers,
    fetchAllConversations,
    getConversationMessages,
  };
}
