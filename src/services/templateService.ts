import { supabase } from '@/integrations/supabase/client';
import type { PromptTemplate, TemplateCategory } from '@/types/database';

export const templateService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('user_id', userId)
      .order('usage_count', { ascending: false });
    
    if (error) throw error;
    return data as PromptTemplate[];
  },

  async getByCategory(userId: string, category: TemplateCategory) {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('usage_count', { ascending: false });
    
    if (error) throw error;
    return data as PromptTemplate[];
  },

  async create(template: {
    user_id: string;
    name: string;
    description?: string;
    content: string;
    category: TemplateCategory;
    variables?: string[];
  }) {
    const { data, error } = await supabase
      .from('prompt_templates')
      .insert(template)
      .select()
      .single();
    
    if (error) throw error;
    return data as PromptTemplate;
  },

  async update(id: string, updates: Partial<PromptTemplate>) {
    const { data, error } = await supabase
      .from('prompt_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as PromptTemplate;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async incrementUsage(id: string) {
    const { data: template } = await supabase
      .from('prompt_templates')
      .select('usage_count')
      .eq('id', id)
      .single();

    if (template) {
      await supabase
        .from('prompt_templates')
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', id);
    }
  },

  async toggleFavorite(id: string, isFavorite: boolean) {
    return this.update(id, { is_favorite: isFavorite });
  },

  // Extract variables from template content (e.g., {{variable_name}})
  extractVariables(content: string): string[] {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.slice(2, -2).trim()))];
  },

  // Apply variables to template content
  applyVariables(content: string, variables: Record<string, string>): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return result;
  },
};
