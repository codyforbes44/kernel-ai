import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { databaseService } from '@/services/databaseService';
import type { TableInfo, Relationship, DatabaseEditorTab } from '@/types/database-editor';

export function useDatabaseExplorer() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DatabaseEditorTab>('data');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all tables
  const { 
    data: tables = [], 
    isLoading: isLoadingTables, 
    error: tablesError,
    refetch: refetchTables,
  } = useQuery<TableInfo[]>({
    queryKey: ['database-tables'],
    queryFn: () => databaseService.listTables(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch relationships
  const { 
    data: relationships = [],
    isLoading: isLoadingRelationships,
  } = useQuery<Relationship[]>({
    queryKey: ['database-relationships'],
    queryFn: () => databaseService.getRelationships(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter tables based on search
  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group tables by category
  const groupedTables = {
    user: filteredTables.filter(t => 
      ['profiles', 'workspaces', 'projects', 'conversations', 'messages', 'prompt_templates'].includes(t.name)
    ),
    builder: filteredTables.filter(t => 
      t.name.startsWith('builder_') || 
      ['project_files', 'deployments', 'design_systems', 'file_versions', 'error_logs', 'project_analysis', 'deployment_env_vars', 'custom_domains'].includes(t.name)
    ),
    marketplace: filteredTables.filter(t => 
      t.name.startsWith('marketplace_') || t.name.startsWith('component_')
    ),
    github: filteredTables.filter(t => 
      t.name.startsWith('github_') || t.name === 'project_repos'
    ),
    billing: filteredTables.filter(t => 
      t.name.startsWith('subscription')
    ),
    auth: filteredTables.filter(t => 
      ['user_roles', 'login_attempts', 'user_login_locations', 'login_alerts'].includes(t.name)
    ),
    other: filteredTables.filter(t => 
      !['profiles', 'workspaces', 'projects', 'conversations', 'messages', 'prompt_templates',
        'user_roles', 'login_attempts', 'user_login_locations', 'login_alerts',
        'usage_analytics', 'shared_templates'].includes(t.name) &&
      !t.name.startsWith('builder_') &&
      !t.name.startsWith('marketplace_') &&
      !t.name.startsWith('component_') &&
      !t.name.startsWith('github_') &&
      !t.name.startsWith('subscription') &&
      !['project_files', 'deployments', 'design_systems', 'file_versions', 'error_logs', 
        'project_analysis', 'deployment_env_vars', 'custom_domains', 'project_repos'].includes(t.name)
    ),
  };

  const selectTable = useCallback((tableName: string) => {
    setSelectedTable(tableName);
    setActiveTab('data');
  }, []);

  const getRelationshipsForTable = useCallback((tableName: string) => {
    return relationships.filter(
      r => r.sourceTable === tableName || r.targetTable === tableName
    );
  }, [relationships]);

  return {
    tables,
    filteredTables,
    groupedTables,
    selectedTable,
    activeTab,
    searchQuery,
    relationships,
    isLoadingTables,
    isLoadingRelationships,
    tablesError,
    setSearchQuery,
    selectTable,
    setActiveTab,
    refetchTables,
    getRelationshipsForTable,
  };
}
