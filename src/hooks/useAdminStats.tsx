import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from './useAdmin';
import { logger } from '@/lib/logger';
import type { SystemStats, AIUsageStats, LoginLocation, PageView } from '@/types/admin';

export function useAdminStats() {
  const { isAdmin } = useAdmin();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [aiUsageLogs, setAIUsageLogs] = useState<AIUsageStats[]>([]);
  const [loginLocations, setLoginLocations] = useState<LoginLocation[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [modelUsageBreakdown, setModelUsageBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchSystemStats = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);

      // Fetch all data in parallel
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [
        profilesResult,
        messagesResult,
        conversationsResult,
        creditsResult,
        aiLogsResult,
        locationsResult,
        pageViewsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id, created_at, is_suspended, updated_at'),
        supabase.from('messages').select('id, tokens_used, created_at'),
        supabase.from('conversations').select('id'),
        supabase.from('ai_credits').select('balance, total_used, total_purchased'),
        supabase
          .from('ai_usage_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500),
        supabase
          .from('user_login_locations')
          .select('*')
          .order('last_seen_at', { ascending: false })
          .limit(200),
        supabase
          .from('page_views')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000),
      ]);

      const profiles = profilesResult.data || [];
      const messages = messagesResult.data || [];
      const conversations = conversationsResult.data || [];
      const credits = creditsResult.data || [];

      // Calculate stats
      const totalUsers = profiles.length;
      const suspendedUsers = profiles.filter(p => p.is_suspended).length;
      const newUsersToday = profiles.filter(p => new Date(p.created_at) >= today).length;
      const newUsersWeek = profiles.filter(p => new Date(p.created_at) >= weekAgo).length;
      
      // Active users based on profile updated_at (activity)
      const activeUsersToday = profiles.filter(p => new Date(p.updated_at) >= today).length;
      const activeUsersWeek = profiles.filter(p => new Date(p.updated_at) >= weekAgo).length;

      const totalMessages = messages.length;
      const totalTokens = messages.reduce((sum, m) => sum + (m.tokens_used || 0), 0);
      const totalConversations = conversations.length;

      const totalCreditsUsed = credits.reduce((sum, c) => sum + (c.total_used || 0), 0);
      const totalCreditsPurchased = credits.reduce((sum, c) => sum + (c.total_purchased || 0), 0);
      const avgCreditsBalance = credits.length > 0 
        ? Math.round(credits.reduce((sum, c) => sum + (c.balance || 0), 0) / credits.length)
        : 0;

      setSystemStats({
        totalUsers,
        activeUsersToday,
        activeUsersWeek,
        newUsersToday,
        newUsersWeek,
        totalMessages,
        totalConversations,
        totalTokens,
        totalCreditsUsed,
        totalCreditsPurchased,
        avgCreditsBalance,
        suspendedUsers,
      });

      // Process AI usage logs
      const aiLogs = (aiLogsResult.data || []) as AIUsageStats[];
      setAIUsageLogs(aiLogs);

      // Calculate model usage breakdown
      const modelBreakdown: Record<string, number> = {};
      aiLogs.forEach(log => {
        modelBreakdown[log.model] = (modelBreakdown[log.model] || 0) + 1;
      });
      setModelUsageBreakdown(modelBreakdown);

      // Process login locations
      setLoginLocations((locationsResult.data || []) as LoginLocation[]);

      // Process page views
      setPageViews((pageViewsResult.data || []) as PageView[]);

    } catch (error) {
      logger.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchSystemStats();
  }, [fetchSystemStats]);

  // Setup real-time subscription for page_views
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-page-views')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'page_views' },
        (payload) => {
          const newView = payload.new as PageView;
          setPageViews(prev => [newView, ...prev].slice(0, 1000));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const suspendUser = useCallback(async (userId: string, suspend: boolean) => {
    if (!isAdmin) return false;

    const { error } = await supabase
      .from('profiles')
      .update({ is_suspended: suspend })
      .eq('id', userId);

    if (error) {
      logger.error('Error updating user suspension:', error);
      return false;
    }

    // Log the action
    const user = await supabase.auth.getUser();
    await supabase.from('admin_audit_log').insert({
      admin_user_id: user.data.user?.id,
      action: suspend ? 'suspend_user' : 'unsuspend_user',
      target_type: 'user',
      target_id: userId,
    });

    return true;
  }, [isAdmin]);

  const grantCredits = useCallback(async (userId: string, amount: number) => {
    if (!isAdmin || amount <= 0) return false;

    // First get current balance
    const { data: currentCredits } = await supabase
      .from('ai_credits')
      .select('balance, total_purchased')
      .eq('user_id', userId)
      .single();

    const newBalance = (currentCredits?.balance || 0) + amount;
    const newTotalPurchased = (currentCredits?.total_purchased || 0) + amount;

    const { error } = await supabase
      .from('ai_credits')
      .update({ 
        balance: newBalance,
        total_purchased: newTotalPurchased
      })
      .eq('user_id', userId);

    if (error) {
      logger.error('Error granting credits:', error);
      return false;
    }

    // Log the action
    const user = await supabase.auth.getUser();
    await supabase.from('admin_audit_log').insert({
      admin_user_id: user.data.user?.id,
      action: 'grant_credits',
      target_type: 'user',
      target_id: userId,
      details: { amount, new_balance: newBalance },
    });

    return true;
  }, [isAdmin]);

  return {
    systemStats,
    aiUsageLogs,
    loginLocations,
    pageViews,
    modelUsageBreakdown,
    loading,
    refetch: fetchSystemStats,
    suspendUser,
    grantCredits,
  };
}
