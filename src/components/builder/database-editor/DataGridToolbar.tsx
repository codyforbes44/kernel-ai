import { Search, Plus, Trash2, Download, RefreshCw, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataGridToolbarProps {
  search: string;
  selectedCount: number;
  pageSize: number;
  isLoading: boolean;
  onSearchChange: (search: string) => void;
  onAddRecord: () => void;
  onDeleteSelected: () => void;
  onRefresh: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onPageSizeChange: (size: number) => void;
}

export function DataGridToolbar({
  search,
  selectedCount,
  pageSize,
  isLoading,
  onSearchChange,
  onAddRecord,
  onDeleteSelected,
  onRefresh,
  onExportJSON,
  onExportCSV,
  onPageSizeChange,
}: DataGridToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-3 border-b border-border bg-card">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search records..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Add Record */}
      <Button size="sm" onClick={onAddRecord} className="gap-1.5">
        <Plus className="h-4 w-4" />
        Add Record
      </Button>

      {/* Delete Selected */}
      {selectedCount > 0 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteSelected}
          className="gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          Delete ({selectedCount})
        </Button>
      )}

      {/* Refresh */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRefresh}
        disabled={isLoading}
        className="h-9 w-9"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>

      {/* Export */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onExportJSON}>
            <FileJson className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Page Size */}
      <Select
        value={pageSize.toString()}
        onValueChange={(v) => onPageSizeChange(parseInt(v))}
      >
        <SelectTrigger className="w-[100px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 rows</SelectItem>
          <SelectItem value="25">25 rows</SelectItem>
          <SelectItem value="50">50 rows</SelectItem>
          <SelectItem value="100">100 rows</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
