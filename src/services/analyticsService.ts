import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

export const analyticsService = {
  async getUsageStats(userId: string, days: number = 30) {
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('usage_analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .order('date');
    
    if (error) throw error;
    return data;
  },

  async trackUsage(userId: string, updates: {
    messages_sent?: number;
    tokens_used?: number;
    conversations_created?: number;
    templates_used?: number;
  }) {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const { data: existing } = await supabase
      .from('usage_analytics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('usage_analytics')
        .update({
          messages_sent: (existing.messages_sent || 0) + (updates.messages_sent || 0),
          tokens_used: (existing.tokens_used || 0) + (updates.tokens_used || 0),
          conversations_created: (existing.conversations_created || 0) + (updates.conversations_created || 0),
          templates_used: (existing.templates_used || 0) + (updates.templates_used || 0),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('usage_analytics')
        .insert({
          user_id: userId,
          date: today,
          ...updates,
        });
    }
  },

  async getTotalStats(userId: string) {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId);

    const { data: messages } = await supabase
      .from('messages')
      .select('tokens_used')
      .eq('user_id', userId);

    const { data: templates } = await supabase
      .from('prompt_templates')
      .select('usage_count')
      .eq('user_id', userId);

    return {
      totalConversations: conversations?.length || 0,
      totalMessages: messages?.length || 0,
      totalTokens: messages?.reduce((sum, m) => sum + (m.tokens_used || 0), 0) || 0,
      totalTemplateUsage: templates?.reduce((sum, t) => sum + (t.usage_count || 0), 0) || 0,
    };
  },
};
