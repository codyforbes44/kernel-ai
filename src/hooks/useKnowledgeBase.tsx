import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { KnowledgeBase, TechStackItem, ContextDocument } from '@/types/knowledge-base';
import { defaultKnowledgeBase } from '@/types/knowledge-base';
import type { Json } from '@/integrations/supabase/types';

export function useKnowledgeBase(projectId: string) {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>(defaultKnowledgeBase);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch knowledge base from project settings
  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      try {
        const { data, error } = await supabase
          .from('builder_projects')
          .select('settings')
          .eq('id', projectId)
          .single();

        if (error) throw error;

        const settings = data?.settings as Record<string, unknown> | null;
        if (settings?.knowledge_base) {
          setKnowledgeBase(settings.knowledge_base as KnowledgeBase);
        }
      } catch (error) {
        console.error('Failed to fetch knowledge base:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchKnowledgeBase();
    }
  }, [projectId]);

  // Auto-save with debounce
  const saveKnowledgeBase = useCallback(async (kb: KnowledgeBase) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        // First fetch current settings to merge
        const { data: current, error: fetchError } = await supabase
          .from('builder_projects')
          .select('settings')
          .eq('id', projectId)
          .single();

        if (fetchError) throw fetchError;

        const currentSettings = (current?.settings as Record<string, unknown>) || {};
        const updatedKb = {
          ...kb,
          lastUpdated: new Date().toISOString(),
        };
        
        // Convert to JSON-safe format
        const updatedSettings = JSON.parse(JSON.stringify({
          ...currentSettings,
          knowledge_base: updatedKb,
        }));

        const { error } = await supabase
          .from('builder_projects')
          .update({ settings: updatedSettings })
          .eq('id', projectId);

        if (error) throw error;
      } catch (error) {
        console.error('Failed to save knowledge base:', error);
        toast.error('Failed to save knowledge base');
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  }, [projectId]);

  // Update instructions
  const updateInstructions = useCallback((instructions: string) => {
    const updated = { ...knowledgeBase, instructions };
    setKnowledgeBase(updated);
    saveKnowledgeBase(updated);
  }, [knowledgeBase, saveKnowledgeBase]);

  // Tech stack operations
  const addTechStackItem = useCallback((item: Omit<TechStackItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    const updated = {
      ...knowledgeBase,
      techStack: [...knowledgeBase.techStack, newItem],
    };
    setKnowledgeBase(updated);
    saveKnowledgeBase(updated);
  }, [knowledgeBase, saveKnowledgeBase]);

  const updateTechStackItem = useCallback((id: string, updates: Partial<TechStackItem>) => {
    const updated = {
      ...knowledgeBase,
      techStack: knowledgeBase.techStack.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    };
    setKnowledgeBase(updated);
    saveKnowledgeBase(updated);
  }, [knowledgeBase, saveKnowledgeBase]);

  const removeTechStackItem = useCallback((id: string) => {
    const updated = {
      ...knowledgeBase,
      techStack: knowledgeBase.techStack.filter(item => item.id !== id),
    };
    setKnowledgeBase(updated);
    saveKnowledgeBase(updated);
  }, [knowledgeBase, saveKnowledgeBase]);

  // Conventions operations
  const updateConventions = useCallback((conventions: Partial<KnowledgeBase['conventions']>) => {
    const updated = {
      ...knowledgeBase,
      conventions: { ...knowledgeBase.conventions, ...conventions },
    };
    setKnowledgeBase(updated);
    saveKnowledgeBase(updated);
  }, [knowledgeBase, saveKnowledgeBase]);

  const addCustomRule = useCallback((rule: string) => {
    const updated = {
      ...knowledgeBase,
      conventions: {
        ...knowledgeBase.conventions,
        customRules: [...knowledgeBase.conventions.customRules, rule],
      },
    };
    setKnowledgeBase(updated);
    saveKnowledgeBase(updated);
  }, [knowledgeBase, saveKnowledgeBase]);

  const removeCustomRule = useCallback((index: number) => {
    const updated = {
      ...knowledgeBase,
      conventions: {
        ...knowledgeBase.conventions,
        customRules: knowledgeBase.conventions.customRules.filter((_, i) => i !== index),
      },
    };
    setKnowledgeBase(updated);
    saveKnowledgeBase(updated);
  }, [knowledgeBase, saveKnowledgeBase]);

  // Context documents operations
  const addContextDoc = useCallback((doc: Omit<ContextDocument, 'id'>) => {
    const newDoc = { ...doc, id: crypto.randomUUID() };
    const updated = {
      ...knowledgeBase,
      contextDocs: [...knowledgeBase.contextDocs, newDoc],
    };
    setKnowledgeBase(updated);
    saveKnowledgeBase(updated);
  }, [knowledgeBase, saveKnowledgeBase]);

  const updateContextDoc = useCallback((id: string, updates: Partial<ContextDocument>) => {
    const updated = {
      ...knowledgeBase,
      contextDocs: knowledgeBase.contextDocs.map(doc =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    };
    setKnowledgeBase(updated);
    saveKnowledgeBase(updated);
  }, [knowledgeBase, saveKnowledgeBase]);

  const removeContextDoc = useCallback((id: string) => {
    const updated = {
      ...knowledgeBase,
      contextDocs: knowledgeBase.contextDocs.filter(doc => doc.id !== id),
    };
    setKnowledgeBase(updated);
    saveKnowledgeBase(updated);
  }, [knowledgeBase, saveKnowledgeBase]);

  // Export/Import
  const exportKnowledgeBase = useCallback(() => {
    const blob = new Blob([JSON.stringify(knowledgeBase, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge-base.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Knowledge base exported');
  }, [knowledgeBase]);

  const importKnowledgeBase = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as KnowledgeBase;
        setKnowledgeBase(imported);
        saveKnowledgeBase(imported);
        toast.success('Knowledge base imported');
      } catch {
        toast.error('Invalid knowledge base file');
      }
    };
    reader.readAsText(file);
  }, [saveKnowledgeBase]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    knowledgeBase,
    isLoading,
    isSaving,
    updateInstructions,
    addTechStackItem,
    updateTechStackItem,
    removeTechStackItem,
    updateConventions,
    addCustomRule,
    removeCustomRule,
    addContextDoc,
    updateContextDoc,
    removeContextDoc,
    exportKnowledgeBase,
    importKnowledgeBase,
  };
}
