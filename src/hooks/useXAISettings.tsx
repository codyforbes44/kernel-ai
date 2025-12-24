import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface XAISettings {
  id: string;
  is_enabled: boolean;
  rate_limit_per_user_daily: number;
  alert_threshold_daily: number;
  default_model: string;
  max_tokens_per_request: number;
  created_at: string;
  updated_at: string;
}

export interface XAIUsageTracking {
  id: string;
  user_id: string;
  request_date: string;
  request_count: number;
  tokens_used: number;
  credits_used: number;
  created_at: string;
  updated_at: string;
}

export interface XAIUsageSummary {
  totalRequests: number;
  totalTokens: number;
  totalCredits: number;
  usageByDate: { date: string; requests: number; tokens: number }[];
  topUsers: { user_id: string; request_count: number; tokens_used: number }[];
}

export function useXAISettings() {
  const queryClient = useQueryClient();

  // Fetch xAI settings
  const {
    data: settings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ['xai-settings'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('xai_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching xAI settings:', error);
        return null;
      }

      return data as XAISettings;
    },
  });

  // Fetch usage tracking data (for admin)
  const {
    data: usageData = [],
    isLoading: isLoadingUsage,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ['xai-usage-tracking'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('xai_usage_tracking')
        .select('*')
        .order('request_date', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching xAI usage:', error);
        return [];
      }

      return (data || []) as XAIUsageTracking[];
    },
  });

  // Calculate usage summary
  const usageSummary: XAIUsageSummary = {
    totalRequests: usageData.reduce((sum, u) => sum + u.request_count, 0),
    totalTokens: usageData.reduce((sum, u) => sum + u.tokens_used, 0),
    totalCredits: usageData.reduce((sum, u) => sum + u.credits_used, 0),
    usageByDate: usageData.reduce((acc, u) => {
      const existing = acc.find(d => d.date === u.request_date);
      if (existing) {
        existing.requests += u.request_count;
        existing.tokens += u.tokens_used;
      } else {
        acc.push({ date: u.request_date, requests: u.request_count, tokens: u.tokens_used });
      }
      return acc;
    }, [] as { date: string; requests: number; tokens: number }[]),
    topUsers: usageData
      .reduce((acc, u) => {
        const existing = acc.find(d => d.user_id === u.user_id);
        if (existing) {
          existing.request_count += u.request_count;
          existing.tokens_used += u.tokens_used;
        } else {
          acc.push({ user_id: u.user_id, request_count: u.request_count, tokens_used: u.tokens_used });
        }
        return acc;
      }, [] as { user_id: string; request_count: number; tokens_used: number }[])
      .sort((a, b) => b.request_count - a.request_count)
      .slice(0, 10),
  };

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<XAISettings>) => {
      if (!settings?.id) throw new Error('Settings not found');

      const { error } = await (supabase as any)
        .from('xai_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('xAI settings updated');
      queryClient.invalidateQueries({ queryKey: ['xai-settings'] });
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  // Toggle enabled state
  const toggleEnabled = () => {
    if (settings) {
      updateSettingsMutation.mutate({ is_enabled: !settings.is_enabled });
    }
  };

  // Update rate limit
  const updateRateLimit = (limit: number) => {
    updateSettingsMutation.mutate({ rate_limit_per_user_daily: limit });
  };

  // Update alert threshold
  const updateAlertThreshold = (threshold: number) => {
    updateSettingsMutation.mutate({ alert_threshold_daily: threshold });
  };

  // Update default model
  const updateDefaultModel = (model: string) => {
    updateSettingsMutation.mutate({ default_model: model });
  };

  // Check if API key is configured
  const checkApiKeyStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('x-automation', {
        body: { action: 'status' },
      });
      return !error && data?.configured === true;
    } catch {
      return false;
    }
  };

  return {
    settings,
    isLoadingSettings,
    refetchSettings,
    usageData,
    usageSummary,
    isLoadingUsage,
    refetchUsage,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
    toggleEnabled,
    updateRateLimit,
    updateAlertThreshold,
    updateDefaultModel,
    checkApiKeyStatus,
    isLoading: isLoadingSettings || isLoadingUsage,
  };
}
