import { supabase } from '@/integrations/supabase/client';
import type { 
  TableInfo, 
  TableSchema, 
  Relationship, 
  QueryOptions, 
  PaginatedResult,
  ColumnSchema 
} from '@/types/database-editor';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Known tables with their approximate schemas
const KNOWN_TABLES: TableInfo[] = [
  { name: 'profiles', rowCount: 0, hasRLS: true },
  { name: 'workspaces', rowCount: 0, hasRLS: true },
  { name: 'projects', rowCount: 0, hasRLS: true },
  { name: 'conversations', rowCount: 0, hasRLS: true },
  { name: 'messages', rowCount: 0, hasRLS: true },
  { name: 'prompt_templates', rowCount: 0, hasRLS: true },
  { name: 'usage_analytics', rowCount: 0, hasRLS: true },
  { name: 'builder_projects', rowCount: 0, hasRLS: true },
  { name: 'builder_conversations', rowCount: 0, hasRLS: true },
  { name: 'builder_messages', rowCount: 0, hasRLS: true },
  { name: 'project_files', rowCount: 0, hasRLS: true },
  { name: 'deployments', rowCount: 0, hasRLS: true },
  { name: 'design_systems', rowCount: 0, hasRLS: true },
  { name: 'marketplace_components', rowCount: 0, hasRLS: true },
  { name: 'component_installations', rowCount: 0, hasRLS: true },
  { name: 'component_likes', rowCount: 0, hasRLS: true },
  { name: 'github_connections', rowCount: 0, hasRLS: true },
  { name: 'project_repos', rowCount: 0, hasRLS: true },
  { name: 'github_commits', rowCount: 0, hasRLS: true },
  { name: 'file_versions', rowCount: 0, hasRLS: true },
  { name: 'error_logs', rowCount: 0, hasRLS: true },
  { name: 'project_analysis', rowCount: 0, hasRLS: true },
  { name: 'deployment_env_vars', rowCount: 0, hasRLS: true },
  { name: 'custom_domains', rowCount: 0, hasRLS: true },
  { name: 'subscriptions', rowCount: 0, hasRLS: true },
  { name: 'subscription_events', rowCount: 0, hasRLS: true },
  { name: 'shared_templates', rowCount: 0, hasRLS: true },
  { name: 'user_roles', rowCount: 0, hasRLS: true },
  { name: 'login_attempts', rowCount: 0, hasRLS: true },
  { name: 'user_login_locations', rowCount: 0, hasRLS: true },
  { name: 'login_alerts', rowCount: 0, hasRLS: true },
];

// Table schemas derived from Supabase types
const TABLE_SCHEMAS: Record<string, ColumnSchema[]> = {
  profiles: [
    { name: 'id', type: 'uuid', nullable: false, defaultValue: null, isPrimaryKey: true, isForeignKey: false },
    { name: 'display_name', type: 'text', nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'avatar_url', type: 'text', nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'preferences', type: 'jsonb', nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'onboarding_completed', type: 'boolean', nullable: true, defaultValue: 'false', isPrimaryKey: false, isForeignKey: false },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
  ],
  workspaces: [
    { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true, isForeignKey: false },
    { name: 'user_id', type: 'uuid', nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'name', type: 'text', nullable: false, defaultValue: "'Default Workspace'", isPrimaryKey: false, isForeignKey: false },
    { name: 'icon', type: 'text', nullable: true, defaultValue: "'🏠'", isPrimaryKey: false, isForeignKey: false },
    { name: 'color', type: 'text', nullable: true, defaultValue: "'#6366f1'", isPrimaryKey: false, isForeignKey: false },
    { name: 'is_default', type: 'boolean', nullable: true, defaultValue: 'false', isPrimaryKey: false, isForeignKey: false },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
  ],
  builder_projects: [
    { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true, isForeignKey: false },
    { name: 'user_id', type: 'uuid', nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'name', type: 'text', nullable: false, defaultValue: "'Untitled Project'", isPrimaryKey: false, isForeignKey: false },
    { name: 'description', type: 'text', nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'framework', type: 'text', nullable: true, defaultValue: "'react'", isPrimaryKey: false, isForeignKey: false },
    { name: 'template', type: 'text', nullable: true, defaultValue: "'blank'", isPrimaryKey: false, isForeignKey: false },
    { name: 'settings', type: 'jsonb', nullable: true, defaultValue: "'{}'", isPrimaryKey: false, isForeignKey: false },
    { name: 'is_public', type: 'boolean', nullable: true, defaultValue: 'false', isPrimaryKey: false, isForeignKey: false },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
  ],
  messages: [
    { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true, isForeignKey: false },
    { name: 'conversation_id', type: 'uuid', nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: true, foreignTable: 'conversations', foreignColumn: 'id' },
    { name: 'user_id', type: 'uuid', nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'role', type: 'message_role', nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'content', type: 'text', nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'model', type: 'text', nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'tokens_used', type: 'integer', nullable: true, defaultValue: '0', isPrimaryKey: false, isForeignKey: false },
    { name: 'metadata', type: 'jsonb', nullable: true, defaultValue: "'{}'", isPrimaryKey: false, isForeignKey: false },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
  ],
  deployments: [
    { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true, isForeignKey: false },
    { name: 'project_id', type: 'uuid', nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: true, foreignTable: 'builder_projects', foreignColumn: 'id' },
    { name: 'user_id', type: 'uuid', nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'version', type: 'integer', nullable: false, defaultValue: '1', isPrimaryKey: false, isForeignKey: false },
    { name: 'status', type: 'text', nullable: false, defaultValue: "'pending'", isPrimaryKey: false, isForeignKey: false },
    { name: 'environment', type: 'text', nullable: false, defaultValue: "'preview'", isPrimaryKey: false, isForeignKey: false },
    { name: 'deploy_url', type: 'text', nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'subdomain', type: 'text', nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'build_log', type: 'text', nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
    { name: 'created_at', type: 'timestamptz', nullable: true, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
  ],
};

export const databaseService = {
  // Get list of all tables
  async listTables(): Promise<TableInfo[]> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/database-introspect?action=tables`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (!response.ok) {
        console.warn('Failed to fetch tables from edge function, using fallback');
        return KNOWN_TABLES;
      }
      
      const data = await response.json();
      return data.tables || KNOWN_TABLES;
    } catch (error) {
      console.error('Error listing tables:', error);
      return KNOWN_TABLES;
    }
  },

  // Get schema for a specific table
  async getTableSchema(tableName: string): Promise<TableSchema> {
    const columns = TABLE_SCHEMAS[tableName] || [];
    const primaryKey = columns.filter(c => c.isPrimaryKey).map(c => c.name);
    
    return {
      name: tableName,
      columns,
      primaryKey,
      rlsPolicies: [],
    };
  },

  // Get all relationships
  async getRelationships(): Promise<Relationship[]> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/database-introspect?action=relationships`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      return data.relationships || [];
    } catch (error) {
      console.error('Error getting relationships:', error);
      return [];
    }
  },

  // Fetch records with pagination, sorting, filtering
  async fetchRecords(tableName: string, options: QueryOptions): Promise<PaginatedResult> {
    const { page, pageSize, sortColumn, sortDirection, filters, search } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      // Build query dynamically using the table name
      let query = supabase.from(tableName as 'profiles').select('*', { count: 'exact' });

      // Apply sorting
      if (sortColumn) {
        query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
      }

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([column, value]) => {
          if (value) {
            query = query.ilike(column, `%${value}%`);
          }
        });
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        console.error('Error fetching records:', error);
        throw error;
      }

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error) {
      console.error('Error in fetchRecords:', error);
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }
  },

  // Insert a new record
  async insertRecord(tableName: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data: result, error } = await supabase
      .from(tableName as 'profiles')
      .insert(data as never)
      .select()
      .single();

    if (error) {
      console.error('Error inserting record:', error);
      throw error;
    }

    return result as Record<string, unknown>;
  },

  // Update an existing record
  async updateRecord(tableName: string, id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data: result, error } = await supabase
      .from(tableName as 'profiles')
      .update(data as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating record:', error);
      throw error;
    }

    return result as Record<string, unknown>;
  },

  // Delete a record
  async deleteRecord(tableName: string, id: string): Promise<void> {
    const { error } = await supabase
      .from(tableName as 'profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  },

  // Delete multiple records
  async deleteRecords(tableName: string, ids: string[]): Promise<void> {
    const { error } = await supabase
      .from(tableName as 'profiles')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting records:', error);
      throw error;
    }
  },

  // Export records to JSON
  async exportToJSON(tableName: string): Promise<string> {
    const { data, error } = await supabase
      .from(tableName as 'profiles')
      .select('*');

    if (error) {
      console.error('Error exporting records:', error);
      throw error;
    }

    return JSON.stringify(data, null, 2);
  },

  // Export records to CSV
  async exportToCSV(tableName: string): Promise<string> {
    const { data, error } = await supabase
      .from(tableName as 'profiles')
      .select('*');

    if (error) {
      console.error('Error exporting records:', error);
      throw error;
    }

    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          const val = (row as Record<string, unknown>)[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
          return String(val);
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  },
};
