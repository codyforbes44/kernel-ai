import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  xAutomationService,
  TweetGenerationOptions,
  ImageGenerationOptions,
  GeneratedTweet,
  TrendAnalysis,
  GeneratedImage,
} from '@/services/xAutomationService';

interface Draft {
  id: string;
  content: string;
  createdAt: Date;
  type: 'tweet' | 'thread';
}

export function useXAutomation() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);

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
    onSuccess: (data) => {
      toast.success('Tweet generated successfully!');
      // Auto-save as draft
      if (data.tweets?.length > 0) {
        const newDraft: Draft = {
          id: crypto.randomUUID(),
          content: data.tweets.join('\n\n'),
          createdAt: new Date(),
          type: data.tweets.length > 1 ? 'thread' : 'tweet',
        };
        setDrafts((prev) => [newDraft, ...prev]);
        setSelectedDraft(newDraft);
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

  // Draft management
  const saveDraft = useCallback((content: string, type: 'tweet' | 'thread' = 'tweet') => {
    const newDraft: Draft = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date(),
      type,
    };
    setDrafts((prev) => [newDraft, ...prev]);
    setSelectedDraft(newDraft);
    toast.success('Draft saved!');
    return newDraft;
  }, []);

  const deleteDraft = useCallback((draftId: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    if (selectedDraft?.id === draftId) {
      setSelectedDraft(null);
    }
    toast.success('Draft deleted');
  }, [selectedDraft]);

  const updateDraft = useCallback((draftId: string, content: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, content } : d))
    );
    if (selectedDraft?.id === draftId) {
      setSelectedDraft((prev) => (prev ? { ...prev, content } : null));
    }
  }, [selectedDraft]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  return {
    // Mutations
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
    selectedDraft,
    setSelectedDraft,
    saveDraft,
    deleteDraft,
    updateDraft,

    // Utils
    copyToClipboard,

    // Loading states
    isLoading:
      generateTweetMutation.isPending ||
      analyzeTrendsMutation.isPending ||
      generateImageMutation.isPending,
  };
}
