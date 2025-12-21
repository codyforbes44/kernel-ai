export interface TableInfo {
  name: string;
  rowCount: number;
  hasRLS: boolean;
  description?: string;
}

export interface ColumnSchema {
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

export interface RLSPolicy {
  name: string;
  command: string;
  definition: string;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  primaryKey: string[];
  rlsPolicies: RLSPolicy[];
}

export interface Relationship {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  constraintName: string;
}

export interface QueryOptions {
  page: number;
  pageSize: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, string>;
  search?: string;
}

export interface PaginatedResult<T = Record<string, unknown>> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type DatabaseEditorTab = 'data' | 'schema' | 'relationships';
