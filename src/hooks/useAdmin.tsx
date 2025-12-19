import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Profile, Conversation, Message } from '@/types/database';

interface UserWithStats extends Profile {
  email?: string;
  conversation_count?: number;
  message_count?: number;
  last_active?: string;
  is_admin?: boolean;
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
        .maybeSingle();

      setIsAdmin(!!data && !error);
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // Optimized: Fetch all users with stats in batched queries instead of N+4 queries per user
  const fetchAllUsers = useCallback(async () => {
    if (!isAdmin) return;

    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      const userIds = profiles?.map(p => p.id) || [];
      if (userIds.length === 0) {
        setUsers([]);
        return;
      }

      // Batch fetch: conversations, messages, and admin roles in parallel
      const [convResult, msgResult, rolesResult] = await Promise.all([
        supabase
          .from('conversations')
          .select('user_id, updated_at')
          .in('user_id', userIds),
        supabase
          .from('messages')
          .select('user_id')
          .in('user_id', userIds),
        supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin')
          .in('user_id', userIds),
      ]);

      // Aggregate stats from batch results
      const convCountMap = new Map<string, number>();
      const lastActiveMap = new Map<string, string>();
      const msgCountMap = new Map<string, number>();
      const adminSet = new Set<string>();

      (convResult.data || []).forEach(c => {
        convCountMap.set(c.user_id, (convCountMap.get(c.user_id) || 0) + 1);
        const existing = lastActiveMap.get(c.user_id);
        if (!existing || (c.updated_at && c.updated_at > existing)) {
          lastActiveMap.set(c.user_id, c.updated_at);
        }
      });

      (msgResult.data || []).forEach(m => {
        msgCountMap.set(m.user_id, (msgCountMap.get(m.user_id) || 0) + 1);
      });

      (rolesResult.data || []).forEach(r => adminSet.add(r.user_id));

      // Build final user list with stats
      const usersWithStats = (profiles || []).map(profile => ({
        ...profile,
        conversation_count: convCountMap.get(profile.id) || 0,
        message_count: msgCountMap.get(profile.id) || 0,
        last_active: lastActiveMap.get(profile.id) || profile.updated_at,
        is_admin: adminSet.has(profile.id),
      } as UserWithStats));

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [isAdmin]);

  // Optimized: Batch fetch user profiles for conversations
  const fetchAllConversations = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data: convs, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Get unique user IDs and batch fetch profiles
      const userIds = [...new Set((convs || []).map(c => c.user_id))];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p.display_name])
      );

      const convsWithUser: ConversationWithUser[] = (convs || []).map(conv => ({
        ...conv,
        user_name: profileMap.get(conv.user_id) || 'Unknown',
      }));

      setConversations(convsWithUser);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [isAdmin]);

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

  const promoteToAdmin = async (userId: string): Promise<boolean> => {
    if (!isAdmin) return false;

    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: 'admin' });

    if (error) {
      console.error('Error promoting user:', error);
      return false;
    }

    await fetchAllUsers();
    return true;
  };

  const demoteFromAdmin = async (userId: string): Promise<boolean> => {
    if (!isAdmin || userId === user?.id) return false; // Can't demote yourself

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (error) {
      console.error('Error demoting user:', error);
      return false;
    }

    await fetchAllUsers();
    return true;
  };

  return {
    isAdmin,
    loading,
    users,
    conversations,
    fetchAllUsers,
    fetchAllConversations,
    getConversationMessages,
    promoteToAdmin,
    demoteFromAdmin,
  };
}
