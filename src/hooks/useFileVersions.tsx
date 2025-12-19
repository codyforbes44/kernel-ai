import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FileVersion {
  id: string;
  file_id: string;
  version_number: number;
  content: string;
  message: string | null;
  created_at: string;
}

export function useFileVersions(fileId: string | null) {
  const queryClient = useQueryClient();

  // Fetch versions for a file
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['file-versions', fileId],
    queryFn: async () => {
      if (!fileId) return [];
      const { data, error } = await supabase
        .from('file_versions')
        .select('*')
        .eq('file_id', fileId)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return data as FileVersion[];
    },
    enabled: !!fileId,
  });

  // Create a new version
  const createVersion = useMutation({
    mutationFn: async ({ 
      fileId, 
      content, 
      message 
    }: { 
      fileId: string; 
      content: string; 
      message?: string;
    }) => {
      // Get the latest version number
      const { data: latest } = await supabase
        .from('file_versions')
        .select('version_number')
        .eq('file_id', fileId)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextVersion = (latest?.version_number || 0) + 1;

      const { data, error } = await supabase
        .from('file_versions')
        .insert({
          file_id: fileId,
          content,
          message: message || null,
          version_number: nextVersion,
        })
        .select()
        .single();

      if (error) throw error;
      return data as FileVersion;
    },
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: ['file-versions', fileId] });
    },
  });

  return {
    versions,
    isLoading,
    createVersion: createVersion.mutateAsync,
  };
}

// Standalone function to create a version (for use outside React components)
export async function createFileVersion(
  fileId: string, 
  content: string, 
  message?: string
): Promise<void> {
  // Get the latest version number
  const { data: latest } = await supabase
    .from('file_versions')
    .select('version_number')
    .eq('file_id', fileId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (latest?.version_number || 0) + 1;

  const { error } = await supabase
    .from('file_versions')
    .insert({
      file_id: fileId,
      content,
      message: message || null,
      version_number: nextVersion,
    });

  if (error) {
    console.error('Failed to create file version:', error);
  }
}
