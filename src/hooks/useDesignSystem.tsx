import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { DesignSystem } from '@/types/marketplace';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface UseDesignSystemOptions {
  projectId: string;
}

export function useDesignSystem({ projectId }: UseDesignSystemOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewSystem, setPreviewSystem] = useState<DesignSystem | null>(null);

  // Fetch design systems for project
  const { data: designSystems = [], isLoading } = useQuery({
    queryKey: ['design-systems', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('design_systems')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as DesignSystem[];
    },
    enabled: !!projectId,
  });

  // Get active design system
  const activeSystem = designSystems.find(s => s.is_active);

  // Generate design system with AI
  const generateDesignSystem = async (prompt: string, style?: string) => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-design-system`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt, style, projectId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate design system');
      }

      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['design-systems', projectId] });
      
      toast({
        title: 'Design system generated',
        description: data.designSystem.name,
      });

      return data.designSystem;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      toast({
        title: 'Generation failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Activate design system
  const activateMutation = useMutation({
    mutationFn: async (systemId: string) => {
      // Deactivate all first
      await supabase
        .from('design_systems')
        .update({ is_active: false })
        .eq('project_id', projectId);

      // Activate selected
      const { error } = await supabase
        .from('design_systems')
        .update({ is_active: true })
        .eq('id', systemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-systems', projectId] });
      toast({ title: 'Design system activated' });
    },
    onError: (error) => {
      toast({
        title: 'Activation failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete design system
  const deleteMutation = useMutation({
    mutationFn: async (systemId: string) => {
      const { error } = await supabase
        .from('design_systems')
        .delete()
        .eq('id', systemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-systems', projectId] });
      toast({ title: 'Design system deleted' });
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Generate CSS variables from design system
  const generateCSSVariables = (system: DesignSystem): string => {
    const lines: string[] = [':root {'];

    // Colors
    if (system.colors) {
      const addColor = (name: string, value: string | { DEFAULT: string; foreground?: string }) => {
        if (typeof value === 'string') {
          lines.push(`  --${name}: ${hexToHsl(value)};`);
        } else {
          lines.push(`  --${name}: ${hexToHsl(value.DEFAULT)};`);
          if (value.foreground) {
            lines.push(`  --${name}-foreground: ${hexToHsl(value.foreground)};`);
          }
        }
      };

      Object.entries(system.colors).forEach(([key, value]) => {
        addColor(key, value);
      });
    }

    // Border radius
    if (system.border_radius) {
      lines.push(`  --radius: ${system.border_radius.DEFAULT || '0.5rem'};`);
    }

    lines.push('}');
    return lines.join('\n');
  };

  // Clear preview when a system is activated
  const handleActivate = (systemId: string) => {
    setPreviewSystem(null);
    activateMutation.mutate(systemId);
  };

  return {
    designSystems,
    activeSystem,
    isLoading,
    isGenerating,
    generateDesignSystem,
    activateSystem: handleActivate,
    isActivating: activateMutation.isPending,
    deleteSystem: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    generateCSSVariables,
    previewSystem,
    setPreviewSystem,
  };
}

// Helper to convert hex to HSL
function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
