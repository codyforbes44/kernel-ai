import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { MarketplaceComponent, ComponentCategory } from '@/types/marketplace';

interface UseMarketplaceOptions {
  projectId?: string;
  category?: ComponentCategory;
  searchQuery?: string;
}

export function useMarketplace({ projectId, category, searchQuery }: UseMarketplaceOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch marketplace components
  const { data: components = [], isLoading } = useQuery({
    queryKey: ['marketplace-components', category, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_components')
        .select('*')
        .eq('is_public', true)
        .order('downloads', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get user's likes and installations
      const { data: { user } } = await supabase.auth.getUser();
      if (user && projectId) {
        const [{ data: likes }, { data: installations }] = await Promise.all([
          supabase
            .from('component_likes')
            .select('component_id')
            .eq('user_id', user.id),
          supabase
            .from('component_installations')
            .select('component_id')
            .eq('project_id', projectId),
        ]);

        const likedIds = new Set(likes?.map(l => l.component_id) || []);
        const installedIds = new Set(installations?.map(i => i.component_id) || []);

        return data.map(c => ({
          ...c,
          is_liked: likedIds.has(c.id),
          is_installed: installedIds.has(c.id),
        })) as MarketplaceComponent[];
      }

      return data as MarketplaceComponent[];
    },
  });

  // Fetch user's components
  const { data: myComponents = [], isLoading: isLoadingMy } = useQuery({
    queryKey: ['my-marketplace-components'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('marketplace_components')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MarketplaceComponent[];
    },
  });

  // Publish component
  const publishMutation = useMutation({
    mutationFn: async (component: {
      name: string;
      description: string | null;
      category: string;
      tags: string[];
      code: string;
      is_public: boolean;
      version: string;
      preview_image_url: string | null;
      dependencies: string[];
      props_schema: Record<string, unknown>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('marketplace_components')
        .insert([{
          name: component.name,
          description: component.description,
          category: component.category,
          tags: component.tags,
          code: component.code,
          is_public: component.is_public,
          version: component.version,
          preview_image_url: component.preview_image_url,
          dependencies: component.dependencies as unknown as undefined,
          props_schema: component.props_schema as unknown as undefined,
          author_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-components'] });
      queryClient.invalidateQueries({ queryKey: ['my-marketplace-components'] });
      toast({ title: 'Component published to marketplace' });
    },
    onError: (error) => {
      toast({
        title: 'Publish failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Install component
  const installMutation = useMutation({
    mutationFn: async (componentId: string) => {
      if (!projectId) throw new Error('No project selected');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Record installation
      await supabase.from('component_installations').insert({
        component_id: componentId,
        project_id: projectId,
        user_id: user.id,
      });

      // Increment download count manually
      const { data: component } = await supabase
        .from('marketplace_components')
        .select('code, name, downloads')
        .eq('id', componentId)
        .single();

      if (component) {
        await supabase
          .from('marketplace_components')
          .update({ downloads: (component.downloads || 0) + 1 })
          .eq('id', componentId);
      }

      return component;
    },
    onSuccess: (component) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-components'] });
      toast({
        title: 'Component installed',
        description: component?.name,
      });
    },
    onError: (error) => {
      toast({
        title: 'Install failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Like/unlike component
  const likeMutation = useMutation({
    mutationFn: async ({ componentId, isLiked }: { componentId: string; isLiked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isLiked) {
        await supabase
          .from('component_likes')
          .delete()
          .eq('component_id', componentId)
          .eq('user_id', user.id);
      } else {
        await supabase.from('component_likes').insert({
          component_id: componentId,
          user_id: user.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-components'] });
    },
  });

  // Delete component
  const deleteMutation = useMutation({
    mutationFn: async (componentId: string) => {
      const { error } = await supabase
        .from('marketplace_components')
        .delete()
        .eq('id', componentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-components'] });
      queryClient.invalidateQueries({ queryKey: ['my-marketplace-components'] });
      toast({ title: 'Component deleted' });
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    components,
    myComponents,
    isLoading,
    isLoadingMy,
    publishComponent: publishMutation.mutateAsync,
    isPublishing: publishMutation.isPending,
    installComponent: installMutation.mutateAsync,
    isInstalling: installMutation.isPending,
    toggleLike: likeMutation.mutate,
    deleteComponent: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
