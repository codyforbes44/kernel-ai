import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface GeneratedAsset {
  id: string;
  user_id: string;
  project_id: string | null;
  prompt: string;
  style: string;
  aspect_ratio: string;
  asset_type: string;
  storage_path: string;
  storage_url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  mime_type: string;
  tags: string[];
  is_favorite: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GenerateImageOptions {
  prompt: string;
  style?: 'realistic' | 'illustration' | 'icon' | '3d' | 'abstract' | 'minimal';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  projectId?: string;
}

export interface ScreenshotToCodeOptions {
  imageUrl?: string;
  imageBase64?: string;
  description?: string;
  componentName?: string;
}

export function useAIAssets(projectId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [generatingImage, setGeneratingImage] = useState(false);
  const [convertingScreenshot, setConvertingScreenshot] = useState(false);

  // Fetch all assets for the user
  const {
    data: assets = [],
    isLoading: isLoadingAssets,
    refetch: refetchAssets,
  } = useQuery({
    queryKey: ['ai-assets', user?.id, projectId],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('generated_assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching assets:', error);
        throw error;
      }

      return data as GeneratedAsset[];
    },
    enabled: !!user?.id,
  });

  // Generate image mutation
  const generateImageMutation = useMutation({
    mutationFn: async (options: GenerateImageOptions) => {
      setGeneratingImage(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            prompt: options.prompt,
            style: options.style || 'realistic',
            aspectRatio: options.aspectRatio || '1:1',
            projectId: options.projectId || projectId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      return data.asset as GeneratedAsset;
    },
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: ['ai-assets'] });
      toast.success('Image generated successfully!');
      return asset;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate image');
    },
    onSettled: () => {
      setGeneratingImage(false);
    },
  });

  // Screenshot to code mutation
  const screenshotToCodeMutation = useMutation({
    mutationFn: async (options: ScreenshotToCodeOptions) => {
      setConvertingScreenshot(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/screenshot-to-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(options),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to convert screenshot');
      }

      const data = await response.json();
      return { code: data.code as string, componentName: data.componentName as string };
    },
    onSuccess: () => {
      toast.success('Screenshot converted to code!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to convert screenshot');
    },
    onSettled: () => {
      setConvertingScreenshot(false);
    },
  });

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset) throw new Error('Asset not found');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('ai-assets')
        .remove([asset.storage_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('generated_assets')
        .delete()
        .eq('id', assetId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-assets'] });
      toast.success('Asset deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete asset');
    },
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset) throw new Error('Asset not found');

      const { error } = await supabase
        .from('generated_assets')
        .update({ is_favorite: !asset.is_favorite })
        .eq('id', assetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-assets'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update asset');
    },
  });

  // Update tags mutation
  const updateTagsMutation = useMutation({
    mutationFn: async ({ assetId, tags }: { assetId: string; tags: string[] }) => {
      const { error } = await supabase
        .from('generated_assets')
        .update({ tags })
        .eq('id', assetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-assets'] });
      toast.success('Tags updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update tags');
    },
  });

  // Helper to copy image URL to clipboard
  const copyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard');
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  // Helper to download image
  const downloadImage = async (asset: GeneratedAsset) => {
    try {
      const response = await fetch(asset.storage_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${asset.prompt.slice(0, 30).replace(/\s+/g, '-')}.${asset.mime_type.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Image downloaded');
    } catch {
      toast.error('Failed to download image');
    }
  };

  // Helper to generate image code snippet
  const getImageCodeSnippet = (asset: GeneratedAsset, format: 'jsx' | 'img' | 'bg' = 'jsx') => {
    switch (format) {
      case 'jsx':
        return `<img src="${asset.storage_url}" alt="${asset.prompt}" className="w-full h-auto" />`;
      case 'img':
        return `<img src="${asset.storage_url}" alt="${asset.prompt}" />`;
      case 'bg':
        return `style={{ backgroundImage: 'url(${asset.storage_url})' }}`;
      default:
        return asset.storage_url;
    }
  };

  return {
    // State
    assets,
    isLoadingAssets,
    generatingImage,
    convertingScreenshot,

    // Mutations
    generateImage: generateImageMutation.mutateAsync,
    screenshotToCode: screenshotToCodeMutation.mutateAsync,
    deleteAsset: deleteAssetMutation.mutateAsync,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    updateTags: updateTagsMutation.mutateAsync,

    // Helpers
    refetchAssets,
    copyImageUrl,
    downloadImage,
    getImageCodeSnippet,
  };
}
