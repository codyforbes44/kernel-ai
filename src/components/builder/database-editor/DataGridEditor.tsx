import { useState } from 'react';
import { ChevronUp, ChevronDown, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DataGridToolbar } from './DataGridToolbar';
import { RecordEditorDialog } from './RecordEditorDialog';
import type { TableSchema } from '@/types/database-editor';
import { cn } from '@/lib/utils';

interface DataGridEditorProps {
  tableName: string;
  records: Record<string, unknown>[];
  schema: TableSchema | undefined;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sortColumn: string | undefined;
  sortDirection: 'asc' | 'desc';
  selectedRows: Set<string>;
  search: string;
  isLoading: boolean;
  isDeleting: boolean;
  onSort: (column: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSearchChange: (search: string) => void;
  onToggleRow: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onInsert: (data: Record<string, unknown>) => Promise<void>;
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBulkDelete: (ids: string[]) => Promise<void>;
  onRefresh: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export function DataGridEditor({
  tableName,
  records,
  schema,
  total,
  page,
  pageSize,
  totalPages,
  sortColumn,
  sortDirection,
  selectedRows,
  search,
  isLoading,
  isDeleting,
  onSort,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onToggleRow,
  onSelectAll,
  onClearSelection,
  onInsert,
  onUpdate,
  onDelete,
  onBulkDelete,
  onRefresh,
  onExportJSON,
  onExportCSV,
}: DataGridEditorProps) {
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const columns = schema?.columns || [];
  const allSelected = records.length > 0 && records.every(r => selectedRows.has((r as { id: string }).id));

  const handleDeleteSelected = async () => {
    await onBulkDelete(Array.from(selectedRows));
    setBulkDeleteConfirm(false);
  };

  const handleDeleteSingle = async () => {
    if (deleteConfirm) {
      await onDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value).slice(0, 50) + '...';
    if (typeof value === 'string' && value.length > 50) return value.slice(0, 50) + '...';
    return String(value);
  };

  return (
    <div className="h-full flex flex-col">
      <DataGridToolbar
        search={search}
        selectedCount={selectedRows.size}
        pageSize={pageSize}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onAddRecord={() => setIsAddDialogOpen(true)}
        onDeleteSelected={() => setBulkDeleteConfirm(true)}
        onRefresh={onRefresh}
        onExportJSON={onExportJSON}
        onExportCSV={onExportCSV}
        onPageSizeChange={onPageSizeChange}
      />

      <ScrollArea className="flex-1">
        <div className="min-w-max">
          {/* Header */}
          <div className="flex items-center border-b border-border bg-muted/50 sticky top-0 z-10">
            <div className="w-10 p-2 flex-shrink-0">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => {
                  if (checked) onSelectAll();
                  else onClearSelection();
                }}
              />
            </div>
            {columns.slice(0, 8).map((col) => (
              <button
                key={col.name}
                onClick={() => onSort(col.name)}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors min-w-[120px] flex-shrink-0',
                  sortColumn === col.name && 'text-foreground'
                )}
              >
                <span className="truncate">{col.name}</span>
                {sortColumn === col.name && (
                  sortDirection === 'asc' ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )
                )}
              </button>
            ))}
            <div className="w-16 flex-shrink-0" />
          </div>

          {/* Body */}
          {isLoading ? (
            <div className="space-y-1 p-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              No records found
            </div>
          ) : (
            <div>
              {records.map((record) => {
                const id = (record as { id: string }).id;
                const isSelected = selectedRows.has(id);

                return (
                  <div
                    key={id}
                    className={cn(
                      'flex items-center border-b border-border hover:bg-muted/30 transition-colors',
                      isSelected && 'bg-primary/5'
                    )}
                  >
                    <div className="w-10 p-2 flex-shrink-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleRow(id)}
                      />
                    </div>
                    {columns.slice(0, 8).map((col) => (
                      <div
                        key={col.name}
                        className="px-3 py-2 text-sm min-w-[120px] flex-shrink-0 truncate"
                        title={String(record[col.name] ?? '')}
                      >
                        {formatCellValue(record[col.name])}
                      </div>
                    ))}
                    <div className="w-16 flex-shrink-0 flex justify-end pr-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingRecord(record)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteConfirm(id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
        <span className="text-sm text-muted-foreground">
          Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, total)} of {total}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <RecordEditorDialog
        open={isAddDialogOpen || !!editingRecord}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingRecord(null);
          }
        }}
        schema={schema}
        record={editingRecord || undefined}
        onSave={async (data) => {
          if (editingRecord) {
            await onUpdate((editingRecord as { id: string }).id, data);
          } else {
            await onInsert(data);
          }
          setIsAddDialogOpen(false);
          setEditingRecord(null);
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSingle} disabled={isDeleting}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedRows.size} Records</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.size} record(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} disabled={isDeleting}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
