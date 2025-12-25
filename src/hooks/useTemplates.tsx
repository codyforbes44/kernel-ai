import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PromptTemplate, TemplateCategory } from '@/types/database';
import { useAuth } from './useAuth';

// Default templates to seed for new users
const DEFAULT_TEMPLATES: Array<{
  name: string;
  description: string;
  content: string;
  category: TemplateCategory;
  variables: string[];
}> = [
  {
    name: 'Debug Error',
    description: 'Analyze and fix error messages',
    content: `I'm encountering this error in my Lovable project:

\`\`\`
{{error_message}}
\`\`\`

Context: {{context}}

Please help me understand what's causing this and how to fix it.`,
    category: 'debug',
    variables: ['error_message', 'context'],
  },
  {
    name: 'Component Generator',
    description: 'Generate a new React component',
    content: `Create a {{component_type}} component called {{component_name}} with the following requirements:

- {{requirements}}

Use TypeScript, Tailwind CSS, and follow Shadcn patterns.`,
    category: 'component',
    variables: ['component_type', 'component_name', 'requirements'],
  },
  {
    name: 'Database Schema',
    description: 'Design database tables',
    content: `I need to create a database schema for {{feature_name}}.

Requirements:
{{requirements}}

Please provide the SQL migration with RLS policies.`,
    category: 'database',
    variables: ['feature_name', 'requirements'],
  },
  {
    name: 'Edge Function',
    description: 'Create a Supabase Edge Function',
    content: `Create an Edge Function called {{function_name}} that:

{{requirements}}

Include proper error handling and CORS headers.`,
    category: 'edge_function',
    variables: ['function_name', 'requirements'],
  },
  {
    name: 'RLS Policy Review',
    description: 'Review Row Level Security',
    content: `Review the RLS policies for the {{table_name}} table:

\`\`\`sql
{{current_policies}}
\`\`\`

Ensure they properly protect data while allowing necessary access.`,
    category: 'rls',
    variables: ['table_name', 'current_policies'],
  },
  {
    name: 'Performance Optimization',
    description: 'Optimize component performance',
    content: `Optimize this component for better performance:

\`\`\`tsx
{{component_code}}
\`\`\`

Focus on: memoization, avoiding re-renders, and bundle size.`,
    category: 'performance',
    variables: ['component_code'],
  },
  {
    name: 'UI/UX Improvement',
    description: 'Improve user interface',
    content: `Improve the UI/UX of {{feature_name}}:

Current issues: {{issues}}

Desired outcome: {{desired_outcome}}`,
    category: 'ui_ux',
    variables: ['feature_name', 'issues', 'desired_outcome'],
  },
  {
    name: 'Refactoring Request',
    description: 'Refactor existing code',
    content: `Refactor this code to be more maintainable:

\`\`\`tsx
{{code}}
\`\`\`

Goals: {{goals}}`,
    category: 'refactor',
    variables: ['code', 'goals'],
  },
  {
    name: 'Documentation Generator',
    description: 'Generate documentation',
    content: `Generate documentation for {{component_or_feature}}:

\`\`\`tsx
{{code}}
\`\`\`

Include: usage examples, props, and best practices.`,
    category: 'docs',
    variables: ['component_or_feature', 'code'],
  },
  {
    name: 'Form with Validation',
    description: 'Create a form with React Hook Form and Zod',
    content: `Create a form for {{form_purpose}} with the following fields:

{{fields}}

Use React Hook Form with Zod validation. Include:
- Proper error messages
- Loading states
- Success/error toasts
- Accessible form labels`,
    category: 'component',
    variables: ['form_purpose', 'fields'],
  },
];

export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSeeded, setHasSeeded] = useState(false);

  // Seed default templates if user has none
  const seedDefaultTemplates = useCallback(async () => {
    if (!user || hasSeeded) return;
    
    try {
      // Check if user already has templates
      const { count } = await supabase
        .from('prompt_templates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (count && count > 0) {
        setHasSeeded(true);
        return;
      }

      console.log('[useTemplates] Seeding default templates for user...');
      
      // Insert default templates
      const templatesWithUserId = DEFAULT_TEMPLATES.map(t => ({
        ...t,
        user_id: user.id,
      }));

      const { error } = await supabase
        .from('prompt_templates')
        .insert(templatesWithUserId);

      if (error) {
        console.error('[useTemplates] Error seeding templates:', error);
      } else {
        console.log('[useTemplates] Successfully seeded', DEFAULT_TEMPLATES.length, 'templates');
      }
      
      setHasSeeded(true);
    } catch (error) {
      console.error('[useTemplates] Seed error:', error);
      setHasSeeded(true);
    }
  }, [user, hasSeeded]);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // First ensure templates are seeded
      await seedDefaultTemplates();
      
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
  }, [user, seedDefaultTemplates]);

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
