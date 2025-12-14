import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UsageAnalytics } from '@/types/database';
import { useAuth } from './useAuth';
import { startOfWeek, subDays, format } from 'date-fns';

export function useAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<UsageAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get last 30 days of analytics
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('usage_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo)
        .order('date', { ascending: true });

      if (error) throw error;
      setAnalytics(data as UsageAnalytics[]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Calculate summary stats
  const summary = useMemo(() => {
    const totalMessages = analytics.reduce((sum, a) => sum + (a.messages_sent || 0), 0);
    const totalTokens = analytics.reduce((sum, a) => sum + (a.tokens_used || 0), 0);
    const totalConversations = analytics.reduce((sum, a) => sum + (a.conversations_created || 0), 0);
    const totalTemplates = analytics.reduce((sum, a) => sum + (a.templates_used || 0), 0);
    
    // Calculate weekly averages
    const weeks = Math.max(1, analytics.length / 7);
    const avgMessagesPerWeek = Math.round(totalMessages / weeks);
    const avgTokensPerWeek = Math.round(totalTokens / weeks);
    
    // Get today's stats
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayStats = analytics.find(a => a.date === today);
    
    return {
      totalMessages,
      totalTokens,
      totalConversations,
      totalTemplates,
      avgMessagesPerWeek,
      avgTokensPerWeek,
      todayMessages: todayStats?.messages_sent || 0,
      todayTokens: todayStats?.tokens_used || 0,
    };
  }, [analytics]);

  // Format data for charts
  const chartData = useMemo(() => {
    return analytics.map(a => ({
      date: format(new Date(a.date), 'MMM d'),
      messages: a.messages_sent || 0,
      tokens: a.tokens_used || 0,
      conversations: a.conversations_created || 0,
      templates: a.templates_used || 0,
    }));
  }, [analytics]);

  return {
    analytics,
    summary,
    chartData,
    loading,
    refresh: fetchAnalytics,
  };
}
