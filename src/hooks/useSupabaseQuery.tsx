import { useQuery, QueryKey } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import { handleError } from '@/lib/errorHandler';

interface UseSupabaseQueryOptions<TData, TSelect = TData> {
  /** The table to query */
  table: string;
  /** Columns to select (defaults to '*') */
  select?: string;
  /** Filter conditions */
  filters?: Record<string, unknown>;
  /** Match filter (eq multiple columns) */
  match?: Record<string, unknown>;
  /** Order by column */
  orderBy?: { column: string; ascending?: boolean };
  /** Limit results */
  limit?: number;
  /** Single result (throws if not exactly one) */
  single?: boolean;
  /** Maybe single result (returns null if not found) */
  maybeSingle?: boolean;
  /** Custom query key (defaults to [table, filters]) */
  queryKey?: QueryKey;
  /** Transform the data before returning */
  transform?: (data: TData) => TSelect;
  /** Whether the query is enabled */
  enabled?: boolean;
  /** Stale time in ms */
  staleTime?: number;
  /** Show error toast on failure */
  showErrorToast?: boolean;
  /** Custom error message prefix */
  errorPrefix?: string;
}

/**
 * A wrapper around useQuery for Supabase queries with standardized patterns.
 * Provides consistent error handling, caching, and query construction.
 * 
 * @example
 * ```tsx
 * // Simple query
 * const { data: conversations } = useSupabaseQuery({
 *   table: 'conversations',
 *   filters: { user_id: userId },
 *   orderBy: { column: 'created_at', ascending: false },
 * });
 * 
 * // With transformation
 * const { data: projectNames } = useSupabaseQuery({
 *   table: 'projects',
 *   select: 'id, name',
 *   transform: (projects) => projects.map(p => p.name),
 * });
 * 
 * // Single record
 * const { data: profile } = useSupabaseQuery({
 *   table: 'profiles',
 *   filters: { id: userId },
 *   single: true,
 * });
 * ```
 */
export function useSupabaseQuery<TData = unknown[], TSelect = TData>({
  table,
  select = '*',
  filters,
  match,
  orderBy,
  limit,
  single = false,
  maybeSingle = false,
  queryKey,
  transform,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes default
  showErrorToast = true,
  errorPrefix,
}: UseSupabaseQueryOptions<TData, TSelect>) {
  const key = queryKey ?? [table, { filters, match, orderBy, limit, single, maybeSingle }];

  return useQuery<TSelect, PostgrestError>({
    queryKey: key,
    queryFn: async (): Promise<TSelect> => {
      // Build query dynamically
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase.from as any)(table).select(select);

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([column, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(column, value);
          }
        });
      }

      // Apply match (multiple eq at once)
      if (match) {
        query = query.match(match);
      }

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      // Execute query
      let result;
      if (single) {
        result = await query.single();
      } else if (maybeSingle) {
        result = await query.maybeSingle();
      } else {
        result = await query;
      }

      if (result.error) {
        if (showErrorToast) {
          handleError(result.error, { 
            prefix: errorPrefix ?? `Failed to fetch ${table}` 
          });
        }
        throw result.error;
      }

      const data = result.data as TData;
      return transform ? transform(data) : (data as unknown as TSelect);
    },
    enabled,
    staleTime,
  });
}

/**
 * Hook for fetching a single record by ID
 */
export function useSupabaseRecord<TData = unknown>({
  table,
  id,
  select = '*',
  enabled = true,
}: {
  table: string;
  id: string | null | undefined;
  select?: string;
  enabled?: boolean;
}) {
  return useSupabaseQuery<TData>({
    table,
    select,
    filters: { id },
    single: true,
    enabled: enabled && !!id,
    queryKey: [table, id],
  });
}

/**
 * Hook for fetching records belonging to the current user
 */
export function useUserRecords<TData = unknown[]>({
  table,
  userId,
  select = '*',
  orderBy,
  limit,
  enabled = true,
}: {
  table: string;
  userId: string | null | undefined;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
}) {
  return useSupabaseQuery<TData>({
    table,
    select,
    filters: { user_id: userId },
    orderBy,
    limit,
    enabled: enabled && !!userId,
    queryKey: [table, 'user', userId],
  });
}
