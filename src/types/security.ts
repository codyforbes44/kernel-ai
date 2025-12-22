// Security Scanning Types

export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type VulnerabilityCategory = 
  | 'rls_disabled'
  | 'rls_missing_policy'
  | 'rls_overly_permissive'
  | 'rls_no_auth_check'
  | 'rls_self_referencing'
  | 'sensitive_data_exposed'
  | 'missing_operation_policy'
  | 'public_access_risk'
  | 'recursion_risk'
  | 'best_practice';

export interface SecurityFinding {
  id: string;
  tableName: string;
  severity: SecuritySeverity;
  category: VulnerabilityCategory;
  title: string;
  description: string;
  remediation: string;
  affectedOperations?: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE')[];
  policyName?: string;
  columnName?: string;
}

export interface SecurityScanSummary {
  totalTables: number;
  tablesWithRLS: number;
  tablesWithoutRLS: number;
  tablesWithIssues: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface TableSecurityStatus {
  tableName: string;
  rlsEnabled: boolean;
  policyCount: number;
  hasSelectPolicy: boolean;
  hasInsertPolicy: boolean;
  hasUpdatePolicy: boolean;
  hasDeletePolicy: boolean;
  findings: SecurityFinding[];
  securityScore: number; // 0-100
}

export interface SecurityScanResult {
  scanId: string;
  scannedAt: string;
  durationMs: number;
  summary: SecurityScanSummary;
  findings: SecurityFinding[];
  tableStatuses: TableSecurityStatus[];
}

export interface RLSPolicy {
  name: string;
  tableName: string;
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  permissive: boolean;
  roles: string[];
  usingExpression: string | null;
  withCheckExpression: string | null;
}

export interface TableSchemaInfo {
  name: string;
  schema: string;
  rlsEnabled: boolean;
  columns: {
    name: string;
    dataType: string;
    isNullable: boolean;
    defaultValue: string | null;
  }[];
  policies: RLSPolicy[];
}

// Sensitive column patterns for detection
export const SENSITIVE_COLUMN_PATTERNS = [
  /password/i,
  /secret/i,
  /api_key/i,
  /apikey/i,
  /token/i,
  /access_token/i,
  /refresh_token/i,
  /private_key/i,
  /credit_card/i,
  /ssn/i,
  /social_security/i,
  /encryption_key/i,
  /auth_token/i,
  /bearer/i,
];

// Tables that should typically have RLS
export const TABLES_REQUIRING_RLS = [
  'profiles',
  'users',
  'accounts',
  'sessions',
  'subscriptions',
  'payments',
  'orders',
  'messages',
  'conversations',
  'documents',
  'files',
];
