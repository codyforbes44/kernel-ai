import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TableInfo {
  name: string;
  rowCount: number;
  hasRLS: boolean;
  description?: string;
}

interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignTable?: string;
  foreignColumn?: string;
  maxLength?: number;
}

interface RLSPolicy {
  name: string;
  command: string;
  definition: string;
}

interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  primaryKey: string[];
  rlsPolicies: RLSPolicy[];
}

interface Relationship {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  constraintName: string;
}

// Input sanitization to prevent SQL injection
// Returns a safely quoted identifier for use in SQL queries
function sanitizeIdentifier(identifier: string): string {
  // Validate input
  if (!identifier || typeof identifier !== 'string') {
    throw new Error('Invalid identifier: must be a non-empty string');
  }
  
  const trimmed = identifier.trim();
  
  // Check length (PostgreSQL identifier limit)
  if (trimmed.length > 128) {
    throw new Error('Invalid identifier: exceeds maximum length');
  }
  
  // STRICT validation: Only allow safe characters
  // Letters, numbers, underscores - NO dots, quotes, or special characters
  // This completely prevents SQL injection as these characters cannot break out of quotes
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
    throw new Error('Invalid identifier: only letters, numbers, and underscores allowed');
  }
  
  // Additional blocklist check for SQL keywords that could be dangerous
  const blockedKeywords = [
    'union', 'select', 'insert', 'update', 'delete', 'drop', 'alter',
    'create', 'truncate', 'exec', 'execute', 'grant', 'revoke'
  ];
  if (blockedKeywords.includes(trimmed.toLowerCase())) {
    throw new Error('Invalid identifier: reserved keyword not allowed');
  }
  
  return trimmed;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'tables';
    const tableName = url.searchParams.get('table');
    
    // External connection parameters
    const externalUrl = url.searchParams.get('external_url');
    const externalKey = url.searchParams.get('external_key');
    
    // Determine which Supabase to use
    const isExternal = !!(externalUrl && externalKey);
    
    let supabaseUrl: string;
    let supabaseKey: string;
    
    if (isExternal) {
      supabaseUrl = externalUrl;
      supabaseKey = externalKey;
      console.log(`External database introspect: action=${action}, table=${tableName}, url=${externalUrl}`);
    } else {
      supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      console.log(`Internal database introspect: action=${action}, table=${tableName}`);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    if (action === 'tables') {
      if (isExternal) {
        // Dynamic introspection for external databases
        return await getExternalTables(supabase, supabaseUrl, supabaseKey);
      } else {
        // Use known tables for internal database
        return await getInternalTables(supabase);
      }
    }

    if (action === 'schema' && tableName) {
      if (isExternal) {
        return await getExternalSchema(supabase, supabaseUrl, supabaseKey, tableName);
      } else {
        return await getInternalSchema(supabase, tableName);
      }
    }

    if (action === 'relationships') {
      if (isExternal) {
        return await getExternalRelationships(supabase, supabaseUrl, supabaseKey);
      } else {
        return await getInternalRelationships();
      }
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Database introspect error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ============ EXTERNAL DATABASE FUNCTIONS ============

// deno-lint-ignore no-explicit-any
async function getExternalTables(supabase: any, url: string, key: string) {
  try {
    // Try to use RPC function if available
    const { data: rpcResult, error: rpcError } = await supabase.rpc('execute_sql', {
      query: `
        SELECT 
          t.table_name as name,
          COALESCE(s.n_live_tup, 0) as row_count,
          COALESCE(c.relrowsecurity, false) as has_rls
        FROM information_schema.tables t
        LEFT JOIN pg_stat_user_tables s ON t.table_name = s.relname
        LEFT JOIN pg_class c ON t.table_name = c.relname
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name
      `
    });

    // deno-lint-ignore no-explicit-any
    if (!rpcError && rpcResult) {
      // deno-lint-ignore no-explicit-any
      const tables: TableInfo[] = (rpcResult.rows || rpcResult || []).map((row: any) => ({
        name: row.name,
        rowCount: row.row_count || 0,
        hasRLS: row.has_rls || false,
      }));

      return new Response(JSON.stringify({ tables }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback: Try to get tables from REST API
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
    });

    if (response.ok) {
      const definitions = await response.json();
      const tables: TableInfo[] = Object.keys(definitions?.definitions || {})
        .filter(name => !name.startsWith('_'))
        .map(name => ({
          name,
          rowCount: 0,
          hasRLS: true, // Assume RLS is enabled
        }));

      return new Response(JSON.stringify({ tables }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Could not retrieve table list');
  } catch (error) {
    console.error('getExternalTables error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to retrieve tables. Make sure the execute_sql function exists.',
      tables: [],
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// deno-lint-ignore no-explicit-any
async function getExternalSchema(supabase: any, url: string, key: string, tableName: string) {
  try {
    // Sanitize table name to prevent SQL injection
    const safeTableName = sanitizeIdentifier(tableName);
    
    // Try RPC for column info
    const { data: colResult, error: colError } = await supabase.rpc('execute_sql', {
      query: `
        SELECT 
          c.column_name as name,
          c.data_type as type,
          c.is_nullable = 'YES' as nullable,
          c.column_default as default_value,
          c.character_maximum_length as max_length,
          COALESCE(pk.is_pk, false) as is_primary_key,
          fk.foreign_table,
          fk.foreign_column
        FROM information_schema.columns c
        LEFT JOIN (
          SELECT kcu.column_name, true as is_pk
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          WHERE tc.table_name = '${safeTableName}' 
          AND tc.constraint_type = 'PRIMARY KEY'
        ) pk ON c.column_name = pk.column_name
        LEFT JOIN (
          SELECT 
            kcu.column_name,
            ccu.table_name as foreign_table,
            ccu.column_name as foreign_column
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
          WHERE tc.table_name = '${safeTableName}' 
          AND tc.constraint_type = 'FOREIGN KEY'
        ) fk ON c.column_name = fk.column_name
        WHERE c.table_name = '${safeTableName}' 
        AND c.table_schema = 'public'
        ORDER BY c.ordinal_position
      `
    });

    // deno-lint-ignore no-explicit-any
    const columns: ColumnSchema[] = ((colResult as any)?.rows || []).map((row: {
      name: string;
      type: string;
      nullable: boolean;
      default_value: string | null;
      max_length: number | null;
      is_primary_key: boolean;
      foreign_table: string | null;
      foreign_column: string | null;
    }) => ({
      name: row.name,
      type: row.type,
      nullable: row.nullable,
      defaultValue: row.default_value,
      maxLength: row.max_length,
      isPrimaryKey: row.is_primary_key,
      isForeignKey: !!row.foreign_table,
      foreignTable: row.foreign_table,
      foreignColumn: row.foreign_column,
    }));

    // Get RLS policies (using already sanitized table name)
    const { data: polResult } = await supabase.rpc('execute_sql', {
      query: `
        SELECT 
          polname as name,
          CASE polcmd
            WHEN 'r' THEN 'SELECT'
            WHEN 'a' THEN 'INSERT'
            WHEN 'w' THEN 'UPDATE'
            WHEN 'd' THEN 'DELETE'
            ELSE '*'
          END as command,
          pg_get_expr(polqual, polrelid) as definition
        FROM pg_policy p
        JOIN pg_class c ON p.polrelid = c.oid
        WHERE c.relname = '${safeTableName}'
      `
    });

    // deno-lint-ignore no-explicit-any
    const rlsPolicies: RLSPolicy[] = ((polResult as any)?.rows || []).map((row: {
      name: string;
      command: string;
      definition: string;
    }) => ({
      name: row.name,
      command: row.command,
      definition: row.definition || '',
    }));

    const schema: TableSchema = {
      name: tableName,
      columns,
      primaryKey: columns.filter(c => c.isPrimaryKey).map(c => c.name),
      rlsPolicies,
    };

    return new Response(JSON.stringify({ schema }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('getExternalSchema error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to retrieve schema',
      schema: { name: tableName, columns: [], primaryKey: [], rlsPolicies: [] },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// deno-lint-ignore no-explicit-any
async function getExternalRelationships(supabase: any, url: string, key: string) {
  try {
    const { data: result } = await supabase.rpc('execute_sql', {
      query: `
        SELECT 
          tc.table_name as source_table,
          kcu.column_name as source_column,
          ccu.table_name as target_table,
          ccu.column_name as target_column,
          tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      `
    });

    // deno-lint-ignore no-explicit-any
    const relationships: Relationship[] = ((result as any)?.rows || []).map((row: {
      source_table: string;
      source_column: string;
      target_table: string;
      target_column: string;
      constraint_name: string;
    }) => ({
      sourceTable: row.source_table,
      sourceColumn: row.source_column,
      targetTable: row.target_table,
      targetColumn: row.target_column,
      constraintName: row.constraint_name,
    }));

    return new Response(JSON.stringify({ relationships }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('getExternalRelationships error:', error);
    return new Response(JSON.stringify({ relationships: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// ============ INTERNAL DATABASE FUNCTIONS ============

// deno-lint-ignore no-explicit-any
async function getInternalTables(supabase: any) {
  const tables: TableInfo[] = [];
  
  const knownTables = [
    'profiles', 'workspaces', 'projects', 'conversations', 'messages',
    'prompt_templates', 'usage_analytics', 'builder_projects', 'builder_conversations',
    'builder_messages', 'project_files', 'deployments', 'design_systems',
    'marketplace_components', 'component_installations', 'component_likes',
    'github_connections', 'project_repos', 'github_commits', 'file_versions',
    'error_logs', 'project_analysis', 'deployment_env_vars', 'custom_domains',
    'subscriptions', 'subscription_events', 'shared_templates', 'user_roles',
    'login_attempts', 'user_login_locations', 'login_alerts', 'ai_credits', 
    'ai_usage_logs', 'external_supabase_connections', 'ai_credit_transactions',
    'generated_assets', 'contact_submissions', 'page_views', 'admin_audit_log',
    'agent_sessions'
  ];

  for (const table of knownTables) {
    try {
      const { count } = await supabase
        .from(table as 'profiles')
        .select('*', { count: 'exact', head: true });
      
      tables.push({
        name: table,
        rowCount: count || 0,
        hasRLS: true,
      });
    } catch {
      tables.push({
        name: table,
        rowCount: 0,
        hasRLS: true,
      });
    }
  }

  return new Response(JSON.stringify({ tables }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// deno-lint-ignore no-explicit-any
async function getInternalSchema(_supabase: any, tableName: string) {
  const typeDefinitions = getTableTypeDefinitions(tableName);
  const rlsPolicies = getRLSPolicies(tableName);

  const schema: TableSchema = {
    name: tableName,
    columns: typeDefinitions.columns,
    primaryKey: typeDefinitions.primaryKey,
    rlsPolicies,
  };

  return new Response(JSON.stringify({ schema }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getInternalRelationships() {
  const relationships: Relationship[] = [
    { sourceTable: 'projects', sourceColumn: 'workspace_id', targetTable: 'workspaces', targetColumn: 'id', constraintName: 'projects_workspace_id_fkey' },
    { sourceTable: 'conversations', sourceColumn: 'project_id', targetTable: 'projects', targetColumn: 'id', constraintName: 'conversations_project_id_fkey' },
    { sourceTable: 'messages', sourceColumn: 'conversation_id', targetTable: 'conversations', targetColumn: 'id', constraintName: 'messages_conversation_id_fkey' },
    { sourceTable: 'builder_conversations', sourceColumn: 'project_id', targetTable: 'builder_projects', targetColumn: 'id', constraintName: 'builder_conversations_project_id_fkey' },
    { sourceTable: 'builder_messages', sourceColumn: 'conversation_id', targetTable: 'builder_conversations', targetColumn: 'id', constraintName: 'builder_messages_conversation_id_fkey' },
    { sourceTable: 'project_files', sourceColumn: 'project_id', targetTable: 'builder_projects', targetColumn: 'id', constraintName: 'project_files_project_id_fkey' },
    { sourceTable: 'deployments', sourceColumn: 'project_id', targetTable: 'builder_projects', targetColumn: 'id', constraintName: 'deployments_project_id_fkey' },
    { sourceTable: 'design_systems', sourceColumn: 'project_id', targetTable: 'builder_projects', targetColumn: 'id', constraintName: 'design_systems_project_id_fkey' },
    { sourceTable: 'file_versions', sourceColumn: 'file_id', targetTable: 'project_files', targetColumn: 'id', constraintName: 'file_versions_file_id_fkey' },
    { sourceTable: 'project_repos', sourceColumn: 'project_id', targetTable: 'builder_projects', targetColumn: 'id', constraintName: 'project_repos_project_id_fkey' },
    { sourceTable: 'project_repos', sourceColumn: 'github_connection_id', targetTable: 'github_connections', targetColumn: 'id', constraintName: 'project_repos_github_connection_id_fkey' },
    { sourceTable: 'github_commits', sourceColumn: 'project_repo_id', targetTable: 'project_repos', targetColumn: 'id', constraintName: 'github_commits_project_repo_id_fkey' },
    { sourceTable: 'component_installations', sourceColumn: 'component_id', targetTable: 'marketplace_components', targetColumn: 'id', constraintName: 'component_installations_component_id_fkey' },
    { sourceTable: 'component_installations', sourceColumn: 'project_id', targetTable: 'builder_projects', targetColumn: 'id', constraintName: 'component_installations_project_id_fkey' },
    { sourceTable: 'component_likes', sourceColumn: 'component_id', targetTable: 'marketplace_components', targetColumn: 'id', constraintName: 'component_likes_component_id_fkey' },
    { sourceTable: 'error_logs', sourceColumn: 'project_id', targetTable: 'builder_projects', targetColumn: 'id', constraintName: 'error_logs_project_id_fkey' },
    { sourceTable: 'custom_domains', sourceColumn: 'project_id', targetTable: 'builder_projects', targetColumn: 'id', constraintName: 'custom_domains_project_id_fkey' },
    { sourceTable: 'deployment_env_vars', sourceColumn: 'project_id', targetTable: 'builder_projects', targetColumn: 'id', constraintName: 'deployment_env_vars_project_id_fkey' },
    { sourceTable: 'subscription_events', sourceColumn: 'subscription_id', targetTable: 'subscriptions', targetColumn: 'id', constraintName: 'subscription_events_subscription_id_fkey' },
    { sourceTable: 'login_alerts', sourceColumn: 'location_id', targetTable: 'user_login_locations', targetColumn: 'id', constraintName: 'login_alerts_location_id_fkey' },
    { sourceTable: 'agent_sessions', sourceColumn: 'project_id', targetTable: 'builder_projects', targetColumn: 'id', constraintName: 'agent_sessions_project_id_fkey' },
  ];

  return new Response(JSON.stringify({ relationships }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper to get RLS policies for a table
function getRLSPolicies(tableName: string): RLSPolicy[] {
  const policyMap: Record<string, RLSPolicy[]> = {
    profiles: [
      { name: 'Users can view own profile', command: 'SELECT', definition: 'auth.uid() = id' },
      { name: 'Users can update own profile', command: 'UPDATE', definition: 'auth.uid() = id' },
      { name: 'Users can insert own profile', command: 'INSERT', definition: 'auth.uid() = id' },
    ],
    workspaces: [
      { name: 'Users can view own workspaces', command: 'SELECT', definition: 'auth.uid() = user_id' },
      { name: 'Users can create own workspaces', command: 'INSERT', definition: 'auth.uid() = user_id' },
      { name: 'Users can update own workspaces', command: 'UPDATE', definition: 'auth.uid() = user_id' },
      { name: 'Users can delete own workspaces', command: 'DELETE', definition: 'auth.uid() = user_id' },
    ],
    projects: [
      { name: 'Users can view own projects', command: 'SELECT', definition: 'auth.uid() = user_id' },
      { name: 'Users can create own projects', command: 'INSERT', definition: 'auth.uid() = user_id' },
      { name: 'Users can update own projects', command: 'UPDATE', definition: 'auth.uid() = user_id' },
      { name: 'Users can delete own projects', command: 'DELETE', definition: 'auth.uid() = user_id' },
    ],
    external_supabase_connections: [
      { name: 'Users can view own connections', command: 'SELECT', definition: 'auth.uid() = user_id' },
      { name: 'Users can create own connections', command: 'INSERT', definition: 'auth.uid() = user_id' },
      { name: 'Users can update own connections', command: 'UPDATE', definition: 'auth.uid() = user_id' },
      { name: 'Users can delete own connections', command: 'DELETE', definition: 'auth.uid() = user_id' },
    ],
  };
  
  return policyMap[tableName] || [];
}

// Helper to get type definitions for internal tables
function getTableTypeDefinitions(tableName: string): { columns: ColumnSchema[]; primaryKey: string[] } {
  const schemas: Record<string, { columns: ColumnSchema[]; primaryKey: string[] }> = {
    profiles: {
      columns: [
        { name: 'id', type: 'uuid', nullable: false, defaultValue: null, isPrimaryKey: true, isForeignKey: false },
        { name: 'display_name', type: 'text', nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'avatar_url', type: 'text', nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'preferences', type: 'jsonb', nullable: true, defaultValue: "'{}'::jsonb", isPrimaryKey: false, isForeignKey: false },
        { name: 'onboarding_completed', type: 'boolean', nullable: true, defaultValue: 'false', isPrimaryKey: false, isForeignKey: false },
        { name: 'is_suspended', type: 'boolean', nullable: true, defaultValue: 'false', isPrimaryKey: false, isForeignKey: false },
        { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
        { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
      ],
      primaryKey: ['id'],
    },
    external_supabase_connections: {
      columns: [
        { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true, isForeignKey: false },
        { name: 'user_id', type: 'uuid', nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'project_name', type: 'text', nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'supabase_url', type: 'text', nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'supabase_anon_key', type: 'text', nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'supabase_service_role_key', type: 'text', nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'is_active', type: 'boolean', nullable: true, defaultValue: 'true', isPrimaryKey: false, isForeignKey: false },
        { name: 'last_connected_at', type: 'timestamptz', nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false },
        { name: 'created_at', type: 'timestamptz', nullable: true, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
        { name: 'updated_at', type: 'timestamptz', nullable: true, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false },
      ],
      primaryKey: ['id'],
    },
    builder_projects: {
      columns: [
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
      primaryKey: ['id'],
    },
  };

  return schemas[tableName] || { columns: [], primaryKey: [] };
}
