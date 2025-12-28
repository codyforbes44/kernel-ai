import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MigrationRequest {
  external_url: string;
  external_service_role_key: string;
  sql: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: MigrationRequest = await req.json();
    const { external_url, external_service_role_key, sql } = body;

    // Validate inputs
    if (!external_url || !external_service_role_key || !sql) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: external_url, external_service_role_key, sql' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URL format
    try {
      new URL(external_url);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid Supabase URL format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enhanced SQL injection prevention - block dangerous statements
    const dangerousPatterns = [
      /DROP\s+DATABASE/i,
      /DROP\s+SCHEMA\s+public/i,
      /TRUNCATE\s+pg_/i,
      /DELETE\s+FROM\s+pg_/i,
      /ALTER\s+SYSTEM/i,
      /COPY\s+.*\s+(FROM|TO)\s+PROGRAM/i,  // Block COPY with PROGRAM
      /CREATE\s+EXTENSION\s+.*\s+SUPERUSER/i,  // Block superuser extensions
      /SET\s+ROLE\s+postgres/i,  // Block role escalation to postgres
      /SECURITY\s+LABEL/i,  // Block security label changes
      /ALTER\s+USER\s+.*\s+SUPERUSER/i,  // Block superuser grants
      /pg_execute_server_program/i,  // Block server program execution
      /pg_read_server_files/i,  // Block reading server files
      /pg_write_server_files/i,  // Block writing server files
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(sql)) {
        return new Response(JSON.stringify({ 
          error: 'SQL contains potentially dangerous statements that could compromise database security' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log(`Executing migration on external database: ${external_url}`);
    console.log(`SQL length: ${sql.length} characters`);

    // Create client for the external Supabase project
    const externalSupabase = createClient(external_url, external_service_role_key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Execute the SQL using the REST API with service role
    // We need to use the SQL endpoint for DDL statements
    const sqlEndpoint = `${external_url}/rest/v1/rpc/`;
    
    // Split SQL into individual statements for better error handling
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    const results: { statement: number; success: boolean; error?: string }[] = [];
    let hasError = false;

    // For DDL statements, we need to use the pg_catalog approach or raw SQL
    // Since Supabase JS client doesn't support raw SQL directly, 
    // we'll use the HTTP API to execute against the database
    
    // Note: This requires the external project to have a function that can execute SQL
    // or we need to use a different approach
    
    // For now, we'll attempt to execute via the rpc endpoint if available
    // or provide guidance on setting up the required function

    // Check if the external project has an execute_sql function
    const { data: checkData, error: checkError } = await externalSupabase.rpc('execute_sql', {
      query: 'SELECT 1 as test',
    });

    if (checkError) {
      // The execute_sql function doesn't exist, provide guidance with security warnings
      return new Response(JSON.stringify({
        error: 'External database requires setup',
        details: 'To execute migrations, create this function in your external Supabase project. IMPORTANT: This function bypasses RLS - consider removing it after operations are complete.',
        security_warning: 'WARNING: The execute_sql function uses SECURITY DEFINER which bypasses RLS policies. After completing your migrations, consider: 1) Dropping the function with DROP FUNCTION execute_sql(text), 2) Or restricting it to service_role only.',
        setup_sql: `
-- Run this in your Supabase SQL editor:
-- ⚠️ SECURITY WARNING: This function bypasses RLS. Remove after use!
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Block dangerous operations even in this context
  IF query ~* '(DROP\\s+DATABASE|DROP\\s+SCHEMA\\s+public|ALTER\\s+SYSTEM|TRUNCATE\\s+pg_)' THEN
    RAISE EXCEPTION 'Dangerous operation blocked';
  END IF;
  
  EXECUTE query;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Only grant to service role (not authenticated users)
REVOKE EXECUTE ON FUNCTION execute_sql(text) FROM public;
GRANT EXECUTE ON FUNCTION execute_sql(text) TO service_role;

-- After completing migrations, run this to remove the function:
-- DROP FUNCTION IF EXISTS execute_sql(text);
`,
        cleanup_sql: 'DROP FUNCTION IF EXISTS execute_sql(text);',
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        const { data, error } = await externalSupabase.rpc('execute_sql', {
          query: statement,
        });

        if (error) {
          results.push({ statement: i + 1, success: false, error: error.message });
          hasError = true;
          console.error(`Statement ${i + 1} failed:`, error.message);
        } else {
          results.push({ statement: i + 1, success: true });
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        results.push({ statement: i + 1, success: false, error: errorMessage });
        hasError = true;
        console.error(`Statement ${i + 1} error:`, errorMessage);
      }
    }

    if (hasError) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Some statements failed',
        results,
        executed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        total: statements.length,
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully executed ${statements.length} statement(s)`,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Execute migration error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({ 
      error: message,
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
