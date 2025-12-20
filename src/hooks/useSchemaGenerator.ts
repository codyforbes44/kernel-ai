import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { GeneratedSchema } from '@/components/builder/SchemaPreview';

interface UseSchemaGeneratorOptions {
  onSchemaGenerated?: (schema: GeneratedSchema) => void;
}

export function useSchemaGenerator({ onSchemaGenerated }: UseSchemaGeneratorOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchema, setGeneratedSchema] = useState<GeneratedSchema | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSchema = useCallback(async (
    description: string,
    options: {
      existingTables?: string[];
      includeRLS?: boolean;
      includeTriggers?: boolean;
    } = {}
  ) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-schema`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            description,
            existingTables: options.existingTables || [],
            includeRLS: options.includeRLS ?? true,
            includeTriggers: options.includeTriggers ?? true,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const schema = await response.json() as GeneratedSchema;
      setGeneratedSchema(schema);
      onSchemaGenerated?.(schema);
      
      return schema;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate schema';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [onSchemaGenerated]);

  const clearSchema = useCallback(() => {
    setGeneratedSchema(null);
    setError(null);
  }, []);

  return {
    isGenerating,
    generatedSchema,
    error,
    generateSchema,
    clearSchema,
  };
}

// Detect if a message is asking for database/schema generation
export function isSchemaRequest(message: string): boolean {
  const schemaKeywords = [
    'create table',
    'create tables',
    'database schema',
    'database for',
    'schema for',
    'need a table',
    'need tables',
    'add a table',
    'add tables',
    'store data',
    'save data',
    'persist data',
    'database to store',
    'backend for',
    'supabase table',
    'data model',
    'entities for',
    'set up database',
    'design database',
    'database design',
  ];

  const lowerMessage = message.toLowerCase();
  return schemaKeywords.some(keyword => lowerMessage.includes(keyword));
}
