import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '@/services/databaseService';
import type { QueryOptions, PaginatedResult, TableSchema } from '@/types/database-editor';
import { toast } from 'sonner';

interface UseTableRecordsOptions {
  tableName: string | null;
  initialPageSize?: number;
}

export function useTableRecords({ tableName, initialPageSize = 25 }: UseTableRecordsOptions) {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortColumn, setSortColumn] = useState<string | undefined>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const queryOptions: QueryOptions = {
    page,
    pageSize,
    sortColumn,
    sortDirection,
    filters,
    search,
  };

  // Fetch records
  const {
    data: recordsData,
    isLoading: isLoadingRecords,
    error: recordsError,
    refetch: refetchRecords,
  } = useQuery<PaginatedResult>({
    queryKey: ['table-records', tableName, queryOptions],
    queryFn: () => databaseService.fetchRecords(tableName!, queryOptions),
    enabled: !!tableName,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch schema
  const {
    data: schema,
    isLoading: isLoadingSchema,
  } = useQuery<TableSchema>({
    queryKey: ['table-schema', tableName],
    queryFn: () => databaseService.getTableSchema(tableName!),
    enabled: !!tableName,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Insert mutation
  const insertMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => 
      databaseService.insertRecord(tableName!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-records', tableName] });
      toast.success('Record created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create record: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      databaseService.updateRecord(tableName!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-records', tableName] });
      toast.success('Record updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update record: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => databaseService.deleteRecord(tableName!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-records', tableName] });
      toast.success('Record deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete record: ${error.message}`);
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => databaseService.deleteRecords(tableName!, ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['table-records', tableName] });
      setSelectedRows(new Set());
      toast.success(`${ids.length} record(s) deleted successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete records: ${error.message}`);
    },
  });

  // Sorting
  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPage(1);
  }, [sortColumn]);

  // Filtering
  const handleFilter = useCallback((column: string, value: string) => {
    setFilters(prev => {
      if (!value) {
        const { [column]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [column]: value };
    });
    setPage(1);
  }, []);

  // Row selection
  const toggleRowSelection = useCallback((id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAllRows = useCallback(() => {
    if (!recordsData?.data) return;
    const allIds = recordsData.data.map(r => (r as { id: string }).id);
    setSelectedRows(new Set(allIds));
  }, [recordsData?.data]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  // Export functions
  const exportJSON = useCallback(async () => {
    if (!tableName) return;
    try {
      const json = await databaseService.exportToJSON(tableName);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported to JSON');
    } catch (error) {
      toast.error('Failed to export');
    }
  }, [tableName]);

  const exportCSV = useCallback(async () => {
    if (!tableName) return;
    try {
      const csv = await databaseService.exportToCSV(tableName);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported to CSV');
    } catch (error) {
      toast.error('Failed to export');
    }
  }, [tableName]);

  return {
    // Data
    records: recordsData?.data || [],
    total: recordsData?.total || 0,
    totalPages: recordsData?.totalPages || 0,
    schema,
    
    // Pagination
    page,
    pageSize,
    setPage,
    setPageSize,
    
    // Sorting
    sortColumn,
    sortDirection,
    handleSort,
    
    // Filtering
    filters,
    search,
    handleFilter,
    setSearch,
    
    // Selection
    selectedRows,
    toggleRowSelection,
    selectAllRows,
    clearSelection,
    
    // Loading states
    isLoadingRecords,
    isLoadingSchema,
    recordsError,
    
    // Mutations
    insertRecord: insertMutation.mutateAsync,
    updateRecord: (id: string, data: Record<string, unknown>) => 
      updateMutation.mutateAsync({ id, data }),
    deleteRecord: deleteMutation.mutateAsync,
    bulkDeleteRecords: bulkDeleteMutation.mutateAsync,
    
    isInserting: insertMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending || bulkDeleteMutation.isPending,
    
    // Actions
    refetchRecords,
    exportJSON,
    exportCSV,
  };
}
