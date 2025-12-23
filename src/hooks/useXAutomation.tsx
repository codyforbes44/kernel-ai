import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  xAutomationService,
  TweetGenerationOptions,
  ImageGenerationOptions,
  GeneratedTweet,
  TrendAnalysis,
  GeneratedImage,
} from '@/services/xAutomationService';
import {
  xDatabaseService,
  XTweetDraft,
  XScheduledTweet,
  CreateDraftInput,
  UpdateDraftInput,
  ScheduleTweetInput,
} from '@/services/xDatabaseService';

export function useXAutomation() {
  const queryClient = useQueryClient();
  const [selectedDraft, setSelectedDraft] = useState<XTweetDraft | null>(null);

  // Fetch drafts from database
  const {
    data: drafts = [],
    isLoading: isLoadingDrafts,
    refetch: refetchDrafts,
  } = useQuery({
    queryKey: ['x-tweet-drafts'],
    queryFn: () => xDatabaseService.getDrafts(),
  });

  // Fetch scheduled tweets from database
  const {
    data: scheduledTweets = [],
    isLoading: isLoadingScheduled,
    refetch: refetchScheduled,
  } = useQuery({
    queryKey: ['x-scheduled-tweets'],
    queryFn: () => xDatabaseService.getScheduledTweets(),
  });

  // Generate tweet mutation
  const generateTweetMutation = useMutation({
    mutationFn: async ({
      prompt,
      options,
    }: {
      prompt: string;
      options?: TweetGenerationOptions;
    }) => {
      return xAutomationService.generateTweet(prompt, options);
    },
    onSuccess: async (data) => {
      toast.success('Tweet generated successfully!');
      // Auto-save as draft
      if (data.tweets?.length > 0) {
        try {
          const newDraft = await xDatabaseService.saveDraft({
            content: data.tweets.join('\n\n'),
            type: data.tweets.length > 1 ? 'thread' : 'tweet',
            hashtags: data.hashtags || [],
          });
          queryClient.invalidateQueries({ queryKey: ['x-tweet-drafts'] });
          setSelectedDraft(newDraft);
        } catch (error) {
          console.error('Failed to save draft:', error);
        }
      }
    },
    onError: (error) => {
      toast.error(`Failed to generate tweet: ${error.message}`);
    },
  });

  // Analyze trends mutation
  const analyzeTrendsMutation = useMutation({
    mutationFn: async ({ topic, options }: { topic: string; options?: { model?: string } }) => {
      return xAutomationService.analyzeTrends(topic, options);
    },
    onSuccess: () => {
      toast.success('Trend analysis complete!');
    },
    onError: (error) => {
      toast.error(`Failed to analyze trends: ${error.message}`);
    },
  });

  // Generate image mutation
  const generateImageMutation = useMutation({
    mutationFn: async ({
      prompt,
      options,
    }: {
      prompt: string;
      options?: ImageGenerationOptions;
    }) => {
      return xAutomationService.generateImage(prompt, options);
    },
    onSuccess: (data) => {
      if (data.imageUrl) {
        toast.success('Image generated successfully!');
      } else if (data.error) {
        toast.warning(data.error);
      }
    },
    onError: (error) => {
      toast.error(`Failed to generate image: ${error.message}`);
    },
  });

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: (input: CreateDraftInput) => xDatabaseService.saveDraft(input),
    onSuccess: (data) => {
      toast.success('Draft saved!');
      queryClient.invalidateQueries({ queryKey: ['x-tweet-drafts'] });
      setSelectedDraft(data);
    },
    onError: (error) => {
      toast.error(`Failed to save draft: ${error.message}`);
    },
  });

  // Update draft mutation
  const updateDraftMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDraftInput }) =>
      xDatabaseService.updateDraft(id, input),
    onSuccess: () => {
      toast.success('Draft updated!');
      queryClient.invalidateQueries({ queryKey: ['x-tweet-drafts'] });
    },
    onError: (error) => {
      toast.error(`Failed to update draft: ${error.message}`);
    },
  });

  // Delete draft mutation
  const deleteDraftMutation = useMutation({
    mutationFn: (id: string) => xDatabaseService.deleteDraft(id),
    onSuccess: () => {
      toast.success('Draft deleted');
      queryClient.invalidateQueries({ queryKey: ['x-tweet-drafts'] });
      setSelectedDraft(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete draft: ${error.message}`);
    },
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: string) => xDatabaseService.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['x-tweet-drafts'] });
    },
    onError: (error) => {
      toast.error(`Failed to update favorite: ${error.message}`);
    },
  });

  // Schedule tweet mutation
  const scheduleTweetMutation = useMutation({
    mutationFn: (input: ScheduleTweetInput) => xDatabaseService.scheduleTweet(input),
    onSuccess: () => {
      toast.success('Tweet scheduled!');
      queryClient.invalidateQueries({ queryKey: ['x-scheduled-tweets'] });
    },
    onError: (error) => {
      toast.error(`Failed to schedule tweet: ${error.message}`);
    },
  });

  // Cancel scheduled tweet mutation
  const cancelScheduledMutation = useMutation({
    mutationFn: (id: string) => xDatabaseService.cancelScheduledTweet(id),
    onSuccess: () => {
      toast.success('Scheduled tweet cancelled');
      queryClient.invalidateQueries({ queryKey: ['x-scheduled-tweets'] });
    },
    onError: (error) => {
      toast.error(`Failed to cancel: ${error.message}`);
    },
  });

  // Delete scheduled tweet mutation
  const deleteScheduledMutation = useMutation({
    mutationFn: (id: string) => xDatabaseService.deleteScheduledTweet(id),
    onSuccess: () => {
      toast.success('Scheduled tweet deleted');
      queryClient.invalidateQueries({ queryKey: ['x-scheduled-tweets'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  return {
    // AI Mutations
    generateTweet: generateTweetMutation.mutateAsync,
    isGeneratingTweet: generateTweetMutation.isPending,
    generatedTweet: generateTweetMutation.data as GeneratedTweet | undefined,

    analyzeTrends: analyzeTrendsMutation.mutateAsync,
    isAnalyzingTrends: analyzeTrendsMutation.isPending,
    trendAnalysis: analyzeTrendsMutation.data as TrendAnalysis | undefined,

    generateImage: generateImageMutation.mutateAsync,
    isGeneratingImage: generateImageMutation.isPending,
    generatedImage: generateImageMutation.data as GeneratedImage | undefined,

    // Draft management
    drafts,
    isLoadingDrafts,
    refetchDrafts,
    selectedDraft,
    setSelectedDraft,
    saveDraft: saveDraftMutation.mutateAsync,
    isSavingDraft: saveDraftMutation.isPending,
    updateDraft: updateDraftMutation.mutateAsync,
    isUpdatingDraft: updateDraftMutation.isPending,
    deleteDraft: deleteDraftMutation.mutate,
    isDeletingDraft: deleteDraftMutation.isPending,
    toggleFavorite: toggleFavoriteMutation.mutate,

    // Scheduled tweets
    scheduledTweets,
    isLoadingScheduled,
    refetchScheduled,
    scheduleTweet: scheduleTweetMutation.mutateAsync,
    isSchedulingTweet: scheduleTweetMutation.isPending,
    cancelScheduledTweet: cancelScheduledMutation.mutate,
    isCancellingScheduled: cancelScheduledMutation.isPending,
    deleteScheduledTweet: deleteScheduledMutation.mutate,
    isDeletingScheduled: deleteScheduledMutation.isPending,

    // Utils
    copyToClipboard,

    // Loading states
    isLoading:
      generateTweetMutation.isPending ||
      analyzeTrendsMutation.isPending ||
      generateImageMutation.isPending,
  };
}
