import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RLSPolicy {
  policyname: string;
  tablename: string;
  cmd: string;
  permissive: string;
  roles: string[];
  qual: string | null;
  with_check: string | null;
}

interface TableInfo {
  table_name: string;
  table_schema: string;
  row_security: boolean;
}

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface SecurityFinding {
  id: string;
  tableName: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  remediation: string;
  affectedOperations?: string[];
  policyName?: string;
  columnName?: string;
}

interface TableSecurityStatus {
  tableName: string;
  rlsEnabled: boolean;
  policyCount: number;
  hasSelectPolicy: boolean;
  hasInsertPolicy: boolean;
  hasUpdatePolicy: boolean;
  hasDeletePolicy: boolean;
  findings: SecurityFinding[];
  securityScore: number;
}

const SENSITIVE_PATTERNS = [
  /password/i, /secret/i, /api_key/i, /apikey/i, /token/i,
  /access_token/i, /refresh_token/i, /private_key/i,
  /credit_card/i, /ssn/i, /encryption_key/i, /auth_token/i
];

function generateId(): string {
  return `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function isSensitiveColumn(columnName: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(columnName));
}

function analyzePolicy(policy: RLSPolicy, tableName: string): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const qual = policy.qual?.toLowerCase() || '';
  const withCheck = policy.with_check?.toLowerCase() || '';
  
  // Check for overly permissive policies (true = allow all)
  if (qual === 'true' || qual === '(true)') {
    findings.push({
      id: generateId(),
      tableName,
      severity: 'critical',
      category: 'rls_overly_permissive',
      title: `Policy "${policy.policyname}" allows unrestricted access`,
      description: `The policy uses "true" as the USING condition, which allows all rows to be accessed regardless of the user.`,
      remediation: `ALTER POLICY "${policy.policyname}" ON ${tableName} USING (auth.uid() = user_id);`,
      policyName: policy.policyname,
      affectedOperations: [policy.cmd],
    });
  }

  // Check for missing auth.uid() check
  if (!qual.includes('auth.uid()') && !qual.includes('auth.jwt()') && qual !== 'true' && qual.length > 0) {
    findings.push({
      id: generateId(),
      tableName,
      severity: 'medium',
      category: 'rls_no_auth_check',
      title: `Policy "${policy.policyname}" doesn't verify user identity`,
      description: `The policy doesn't use auth.uid() or auth.jwt() to verify the current user's identity.`,
      remediation: `Consider adding auth.uid() check to the policy: ALTER POLICY "${policy.policyname}" ON ${tableName} USING (auth.uid() = user_id);`,
      policyName: policy.policyname,
      affectedOperations: [policy.cmd],
    });
  }

  // Check for potential infinite recursion (self-referencing)
  if (qual.includes(`from ${tableName.toLowerCase()}`) || qual.includes(`"${tableName.toLowerCase()}"`)) {
    findings.push({
      id: generateId(),
      tableName,
      severity: 'medium',
      category: 'recursion_risk',
      title: `Policy "${policy.policyname}" may cause infinite recursion`,
      description: `The policy references its own table in the condition, which can cause "infinite recursion detected" errors.`,
      remediation: `Use a SECURITY DEFINER function to check permissions instead of querying the same table directly.`,
      policyName: policy.policyname,
      affectedOperations: [policy.cmd],
    });
  }

  // Check INSERT/UPDATE policies for WITH CHECK
  if ((policy.cmd === 'INSERT' || policy.cmd === 'UPDATE' || policy.cmd === 'ALL') && !withCheck && !qual) {
    findings.push({
      id: generateId(),
      tableName,
      severity: 'high',
      category: 'missing_operation_policy',
      title: `Policy "${policy.policyname}" has no WITH CHECK expression`,
      description: `${policy.cmd} operations should have a WITH CHECK expression to validate data being written.`,
      remediation: `ALTER POLICY "${policy.policyname}" ON ${tableName} WITH CHECK (auth.uid() = user_id);`,
      policyName: policy.policyname,
      affectedOperations: [policy.cmd],
    });
  }

  return findings;
}

function calculateSecurityScore(status: Omit<TableSecurityStatus, 'securityScore'>): number {
  let score = 100;
  
  if (!status.rlsEnabled) {
    score -= 50; // Major penalty for no RLS
  }
  
  if (status.rlsEnabled && status.policyCount === 0) {
    score -= 40; // RLS enabled but no policies
  }

  // Deduct for missing policies
  if (status.rlsEnabled) {
    if (!status.hasSelectPolicy) score -= 10;
    if (!status.hasInsertPolicy) score -= 10;
    if (!status.hasUpdatePolicy) score -= 10;
    if (!status.hasDeletePolicy) score -= 5;
  }

  // Deduct based on findings
  for (const finding of status.findings) {
    switch (finding.severity) {
      case 'critical': score -= 20; break;
      case 'high': score -= 10; break;
      case 'medium': score -= 5; break;
      case 'low': score -= 2; break;
    }
  }

  return Math.max(0, Math.min(100, score));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting security scan...");

    // Fetch all public tables using pg_tables
    let tableList: TableInfo[] = [];
    
    try {
      const { data: pgTables } = await supabase
        .from('pg_tables' as any)
        .select('tablename, schemaname')
        .eq('schemaname', 'public');
      
      if (pgTables) {
        tableList = (pgTables as any[]).map(t => ({
          table_name: t.tablename,
          table_schema: 'public',
          row_security: false // Will be updated from policies
        }));
      }
    } catch (e) {
      console.log("Could not fetch pg_tables:", e);
    }

    // Check RLS status from pg_class if possible
    try {
      const { data: rlsInfo } = await supabase
        .from('pg_class' as any)
        .select('relname, relrowsecurity')
        .in('relname', tableList.map(t => t.table_name));
      
      if (rlsInfo) {
        for (const info of rlsInfo as any[]) {
          const table = tableList.find(t => t.table_name === info.relname);
          if (table) {
            table.row_security = info.relrowsecurity || false;
          }
        }
      }
    } catch (e) {
      console.log("Could not fetch RLS status:", e);
    }

    console.log(`Found ${tableList.length} tables`);

    // Fetch all RLS policies
    const { data: policies } = await supabase
      .from('pg_policies' as any)
      .select('*')
      .eq('schemaname', 'public');

    const policyList: RLSPolicy[] = (policies || []).map((p: any) => ({
      policyname: p.policyname,
      tablename: p.tablename,
      cmd: p.cmd,
      permissive: p.permissive,
      roles: p.roles || [],
      qual: p.qual,
      with_check: p.with_check
    }));

    console.log(`Found ${policyList.length} RLS policies`);

    // Fetch column information for sensitive data detection
    const { data: columns } = await supabase
      .from('information_schema.columns' as any)
      .select('table_name, column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public');

    const columnList: ColumnInfo[] = (columns || []) as ColumnInfo[];

    // Analyze each table
    const allFindings: SecurityFinding[] = [];
    const tableStatuses: TableSecurityStatus[] = [];

    for (const table of tableList) {
      const tablePolicies = policyList.filter(p => p.tablename === table.table_name);
      const tableColumns = columnList.filter(c => c.table_name === table.table_name);
      const tableFindings: SecurityFinding[] = [];

      // Check 1: RLS not enabled
      if (!table.row_security) {
        tableFindings.push({
          id: generateId(),
          tableName: table.table_name,
          severity: 'critical',
          category: 'rls_disabled',
          title: `Table "${table.table_name}" has no Row Level Security`,
          description: `This table has RLS disabled, allowing unrestricted access to all authenticated users.`,
          remediation: `ALTER TABLE ${table.table_name} ENABLE ROW LEVEL SECURITY;`
        });
      }

      // Check 2: RLS enabled but no policies
      if (table.row_security && tablePolicies.length === 0) {
        tableFindings.push({
          id: generateId(),
          tableName: table.table_name,
          severity: 'high',
          category: 'rls_missing_policy',
          title: `Table "${table.table_name}" has RLS but no policies`,
          description: `RLS is enabled but no policies exist, which blocks all access to the table.`,
          remediation: `CREATE POLICY "Enable access for users" ON ${table.table_name} FOR ALL USING (auth.uid() = user_id);`
        });
      }

      // Check 3: Analyze individual policies
      for (const policy of tablePolicies) {
        const policyFindings = analyzePolicy(policy, table.table_name);
        tableFindings.push(...policyFindings);
      }

      // Check 4: Missing operation-specific policies
      const hasSelect = tablePolicies.some(p => p.cmd === 'SELECT' || p.cmd === 'ALL');
      const hasInsert = tablePolicies.some(p => p.cmd === 'INSERT' || p.cmd === 'ALL');
      const hasUpdate = tablePolicies.some(p => p.cmd === 'UPDATE' || p.cmd === 'ALL');
      const hasDelete = tablePolicies.some(p => p.cmd === 'DELETE' || p.cmd === 'ALL');

      if (table.row_security && tablePolicies.length > 0) {
        if (!hasSelect) {
          tableFindings.push({
            id: generateId(),
            tableName: table.table_name,
            severity: 'high',
            category: 'missing_operation_policy',
            title: `No SELECT policy for "${table.table_name}"`,
            description: `The table has RLS policies but none specifically for SELECT operations.`,
            remediation: `CREATE POLICY "Enable read access" ON ${table.table_name} FOR SELECT USING (auth.uid() = user_id);`,
            affectedOperations: ['SELECT']
          });
        }
      }

      // Check 5: Sensitive columns exposed
      for (const column of tableColumns) {
        if (isSensitiveColumn(column.column_name) && !table.row_security) {
          tableFindings.push({
            id: generateId(),
            tableName: table.table_name,
            severity: 'high',
            category: 'sensitive_data_exposed',
            title: `Sensitive column "${column.column_name}" is not protected`,
            description: `The column "${column.column_name}" appears to contain sensitive data but the table has no RLS protection.`,
            remediation: `Enable RLS and create policies to protect sensitive data: ALTER TABLE ${table.table_name} ENABLE ROW LEVEL SECURITY;`,
            columnName: column.column_name
          });
        }
      }

      // Build table status
      const status: Omit<TableSecurityStatus, 'securityScore'> = {
        tableName: table.table_name,
        rlsEnabled: table.row_security,
        policyCount: tablePolicies.length,
        hasSelectPolicy: hasSelect,
        hasInsertPolicy: hasInsert,
        hasUpdatePolicy: hasUpdate,
        hasDeletePolicy: hasDelete,
        findings: tableFindings,
      };

      tableStatuses.push({
        ...status,
        securityScore: calculateSecurityScore(status)
      });

      allFindings.push(...tableFindings);
    }

    // Calculate summary
    const summary = {
      totalTables: tableList.length,
      tablesWithRLS: tableList.filter(t => t.row_security).length,
      tablesWithoutRLS: tableList.filter(t => !t.row_security).length,
      tablesWithIssues: tableStatuses.filter(s => s.findings.length > 0).length,
      critical: allFindings.filter(f => f.severity === 'critical').length,
      high: allFindings.filter(f => f.severity === 'high').length,
      medium: allFindings.filter(f => f.severity === 'medium').length,
      low: allFindings.filter(f => f.severity === 'low').length,
      info: allFindings.filter(f => f.severity === 'info').length,
    };

    const result = {
      scanId: `scan_${Date.now()}`,
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      summary,
      findings: allFindings,
      tableStatuses: tableStatuses.sort((a, b) => a.securityScore - b.securityScore),
    };

    console.log(`Security scan complete: ${allFindings.length} findings in ${result.durationMs}ms`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Security scan error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: "Failed to complete security scan"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
