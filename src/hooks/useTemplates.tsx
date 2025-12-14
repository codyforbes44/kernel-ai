import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PromptTemplate, TemplateCategory } from '@/types/database';
import { useAuth } from './useAuth';

export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data as PromptTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = useCallback(async (template: {
    name: string;
    description?: string;
    content: string;
    category: TemplateCategory;
    variables?: string[];
  }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('prompt_templates')
      .insert({
        ...template,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return null;
    }

    const newTemplate = data as PromptTemplate;
    setTemplates(prev => [newTemplate, ...prev]);
    return newTemplate;
  }, [user]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<PromptTemplate>) => {
    const { error } = await supabase
      .from('prompt_templates')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setTemplates(prev => 
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      );
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id);

    if (!error) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  const incrementUsage = useCallback(async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;

    await updateTemplate(id, { usage_count: template.usage_count + 1 });
  }, [templates, updateTemplate]);

  const templatesByCategory = templates.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<TemplateCategory, PromptTemplate[]>);

  return {
    templates,
    templatesByCategory,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    refresh: fetchTemplates,
  };
}
