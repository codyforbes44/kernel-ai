import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AICredits {
  id: string;
  user_id: string;
  balance: number;
  total_purchased: number;
  total_used: number;
  created_at: string;
  updated_at: string;
}

interface AIUsageLog {
  id: string;
  user_id: string;
  conversation_id: string | null;
  function_name: string;
  model: string;
  tokens_input: number;
  tokens_output: number;
  credits_used: number;
  created_at: string;
}

interface UsageStats {
  totalCreditsUsed: number;
  totalTokens: number;
  usageByFunction: Record<string, number>;
  usageByModel: Record<string, number>;
  recentUsage: AIUsageLog[];
}

export function useAICredits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current credit balance
  const { data: credits, isLoading: isLoadingCredits, refetch: refetchCredits } = useQuery({
    queryKey: ['ai-credits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Use any type to avoid deep type instantiation
      const { data, error } = await (supabase as any)
        .from('ai_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching credits:', error);
        return null;
      }

      // If no credits record exists, create one with default balance
      if (!data) {
        const { data: newCredits, error: insertError } = await (supabase as any)
          .from('ai_credits')
          .insert({ user_id: user.id, balance: 1000, total_purchased: 0, total_used: 0 })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating credits:', insertError);
          return null;
        }
        return newCredits as AICredits;
      }

      return data as AICredits;
    },
  });

  // Fetch usage history
  const { data: usageHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['ai-usage-history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('ai_usage_logs' as 'profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching usage history:', error);
        return [];
      }

      return (data || []) as unknown as AIUsageLog[];
    },
  });

  // Calculate usage stats
  const usageStats: UsageStats = {
    totalCreditsUsed: credits?.total_used || 0,
    totalTokens: usageHistory.reduce((acc, log) => acc + log.tokens_input + log.tokens_output, 0),
    usageByFunction: usageHistory.reduce((acc, log) => {
      acc[log.function_name] = (acc[log.function_name] || 0) + log.credits_used;
      return acc;
    }, {} as Record<string, number>),
    usageByModel: usageHistory.reduce((acc, log) => {
      acc[log.model] = (acc[log.model] || 0) + log.credits_used;
      return acc;
    }, {} as Record<string, number>),
    recentUsage: usageHistory.slice(0, 10),
  };

  // Check if user has enough credits
  const checkBalance = (requiredCredits: number): boolean => {
    return (credits?.balance || 0) >= requiredCredits;
  };

  // Deduct credits (called after successful AI call)
  const deductCreditsMutation = useMutation({
    mutationFn: async ({ creditsToDeduct, functionName, model, tokensInput, tokensOutput, conversationId }: {
      creditsToDeduct: number;
      functionName: string;
      model: string;
      tokensInput: number;
      tokensOutput: number;
      conversationId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update credits balance
      const newBalance = (credits?.balance || 0) - creditsToDeduct;
      const newTotalUsed = (credits?.total_used || 0) + creditsToDeduct;

      const { error: updateError } = await supabase
        .from('ai_credits' as 'profiles')
        .update({ 
          balance: newBalance, 
          total_used: newTotalUsed,
          updated_at: new Date().toISOString()
        } as never)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log usage
      const { error: logError } = await supabase
        .from('ai_usage_logs' as 'profiles')
        .insert({
          user_id: user.id,
          conversation_id: conversationId || null,
          function_name: functionName,
          model,
          tokens_input: tokensInput,
          tokens_output: tokensOutput,
          credits_used: creditsToDeduct,
        } as never);

      if (logError) console.error('Error logging usage:', logError);

      return { newBalance };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      queryClient.invalidateQueries({ queryKey: ['ai-usage-history'] });
    },
  });

  // Add credits (after purchase)
  const addCreditsMutation = useMutation({
    mutationFn: async (creditsToAdd: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newBalance = (credits?.balance || 0) + creditsToAdd;
      const newTotalPurchased = (credits?.total_purchased || 0) + creditsToAdd;

      const { error } = await supabase
        .from('ai_credits' as 'profiles')
        .update({ 
          balance: newBalance, 
          total_purchased: newTotalPurchased,
          updated_at: new Date().toISOString()
        } as never)
        .eq('user_id', user.id);

      if (error) throw error;

      return { newBalance };
    },
    onSuccess: ({ newBalance }) => {
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      toast({
        title: 'Credits added',
        description: `Your new balance is ${newBalance} credits`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add credits',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    credits,
    balance: credits?.balance || 0,
    totalPurchased: credits?.total_purchased || 0,
    totalUsed: credits?.total_used || 0,
    usageHistory,
    usageStats,
    isLoading: isLoadingCredits || isLoadingHistory,
    checkBalance,
    deductCredits: deductCreditsMutation.mutate,
    addCredits: addCreditsMutation.mutate,
    refetchCredits,
    isLowBalance: (credits?.balance || 0) < 100,
  };
}