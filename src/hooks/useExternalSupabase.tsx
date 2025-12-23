import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ExternalSupabaseConnection {
  id: string;
  user_id: string;
  project_name: string;
  supabase_url: string;
  supabase_anon_key: string;
  supabase_service_role_key?: string | null;
  is_active: boolean;
  last_connected_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateConnectionInput {
  project_name: string;
  supabase_url: string;
  supabase_anon_key: string;
  supabase_service_role_key?: string;
}

interface UpdateConnectionInput {
  id: string;
  project_name?: string;
  supabase_url?: string;
  supabase_anon_key?: string;
  supabase_service_role_key?: string;
  is_active?: boolean;
}

export function useExternalSupabase() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  // Fetch all connections for the user
  const {
    data: connections = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['external-supabase-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('external_supabase_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ExternalSupabaseConnection[];
    },
    enabled: !!user?.id,
  });

  // Get the currently selected connection
  const selectedConnection = connections.find(c => c.id === selectedConnectionId) || null;

  // Get the active connection (first active one if none selected)
  const activeConnection = selectedConnection || connections.find(c => c.is_active) || null;

  // Test connection to external Supabase
  const testConnection = useCallback(async (url: string, anonKey: string): Promise<boolean> => {
    try {
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Create a new connection
  const createConnectionMutation = useMutation({
    mutationFn: async (input: CreateConnectionInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Test connection first
      const isValid = await testConnection(input.supabase_url, input.supabase_anon_key);
      if (!isValid) {
        throw new Error('Could not connect to the Supabase project. Please check your URL and API key.');
      }

      const { data, error } = await supabase
        .from('external_supabase_connections')
        .insert({
          user_id: user.id,
          project_name: input.project_name,
          supabase_url: input.supabase_url,
          supabase_anon_key: input.supabase_anon_key,
          supabase_service_role_key: input.supabase_service_role_key || null,
          last_connected_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as ExternalSupabaseConnection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-supabase-connections'] });
      toast.success('Connection added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update a connection
  const updateConnectionMutation = useMutation({
    mutationFn: async (input: UpdateConnectionInput) => {
      const { id, ...updates } = input;
      
      // Test connection if URL or key is being updated
      if (updates.supabase_url || updates.supabase_anon_key) {
        const connection = connections.find(c => c.id === id);
        const url = updates.supabase_url || connection?.supabase_url || '';
        const key = updates.supabase_anon_key || connection?.supabase_anon_key || '';
        
        const isValid = await testConnection(url, key);
        if (!isValid) {
          throw new Error('Could not connect with the updated credentials');
        }
      }

      const { data, error } = await supabase
        .from('external_supabase_connections')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ExternalSupabaseConnection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-supabase-connections'] });
      toast.success('Connection updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete a connection
  const deleteConnectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('external_supabase_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-supabase-connections'] });
      toast.success('Connection deleted');
      if (selectedConnectionId) {
        setSelectedConnectionId(null);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Execute SQL migration on external database
  const executeMigration = useCallback(async (
    connectionId: string,
    sql: string
  ): Promise<{ success: boolean; error?: string }> => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) {
      return { success: false, error: 'Connection not found' };
    }

    if (!connection.supabase_service_role_key) {
      return { success: false, error: 'Service role key is required to execute migrations' };
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/execute-migration`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            external_url: connection.supabase_url,
            external_service_role_key: connection.supabase_service_role_key,
            sql,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Migration failed' };
      }

      // Update last connected timestamp
      await supabase
        .from('external_supabase_connections')
        .update({ last_connected_at: new Date().toISOString() })
        .eq('id', connectionId);

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to execute migration' 
      };
    }
  }, [connections]);

  // Introspect external database
  const introspectDatabase = useCallback(async (
    connectionId: string,
    action: 'tables' | 'schema' | 'relationships',
    tableName?: string
  ) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    const params = new URLSearchParams({
      action,
      external_url: connection.supabase_url,
      external_key: connection.supabase_service_role_key || connection.supabase_anon_key,
    });
    
    if (tableName) {
      params.set('table', tableName);
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/database-introspect?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Introspection failed');
    }

    return response.json();
  }, [connections]);

  return {
    connections,
    selectedConnection,
    activeConnection,
    selectedConnectionId,
    isLoading,
    error,
    setSelectedConnectionId,
    createConnection: createConnectionMutation.mutateAsync,
    updateConnection: updateConnectionMutation.mutateAsync,
    deleteConnection: deleteConnectionMutation.mutateAsync,
    testConnection,
    executeMigration,
    introspectDatabase,
    isCreating: createConnectionMutation.isPending,
    isUpdating: updateConnectionMutation.isPending,
    isDeleting: deleteConnectionMutation.isPending,
    refetch,
  };
}
