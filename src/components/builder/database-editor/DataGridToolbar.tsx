import { Search, Plus, Trash2, Download, RefreshCw, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 border-b border-border bg-card">
      {/* Search - Full width on mobile */}
      <div className="relative flex-1 min-w-0 sm:max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search records..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 sm:h-9 touch-manipulation"
        />
      </div>

      {/* Actions row - wraps on mobile */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Add Record */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              onClick={onAddRecord} 
              className="h-10 sm:h-9 gap-1.5 touch-manipulation flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              <span className="sm:inline">Add Record</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="sm:hidden">Add Record</TooltipContent>
        </Tooltip>

        {/* Delete Selected */}
        {selectedCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteSelected}
                className="h-10 sm:h-9 gap-1.5 touch-manipulation"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
                <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs bg-destructive-foreground/20 rounded">
                  {selectedCount}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Delete {selectedCount} selected</TooltipContent>
          </Tooltip>
        )}

        {/* Refresh */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Refresh</TooltipContent>
        </Tooltip>

        {/* Export */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 sm:h-9 gap-1.5 touch-manipulation"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="sm:hidden">Export</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportJSON} className="touch-manipulation">
              <FileJson className="h-4 w-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportCSV} className="touch-manipulation">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Page Size - Hidden on mobile */}
        <Select
          value={pageSize.toString()}
          onValueChange={(v) => onPageSizeChange(parseInt(v))}
        >
          <SelectTrigger className="w-[100px] h-10 sm:h-9 hidden sm:flex touch-manipulation">
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
    </div>
  );
}
