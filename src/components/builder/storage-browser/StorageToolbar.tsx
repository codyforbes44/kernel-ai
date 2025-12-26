import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  Grid3X3, 
  List, 
  Upload, 
  Trash2, 
  RefreshCw,
  FolderPlus,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface StorageToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  selectedCount: number;
  onUploadClick: () => void;
  onDeleteSelected: () => void;
  onRefresh: () => void;
  onCreateFolder: (name: string) => void;
  isDeleting?: boolean;
}

export function StorageToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  selectedCount,
  onUploadClick,
  onDeleteSelected,
  onRefresh,
  onCreateFolder,
  isDeleting,
}: StorageToolbarProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName('');
      setFolderDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
      {/* Search - Full width on mobile */}
      <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 sm:h-9 touch-manipulation"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 touch-manipulation"
            onClick={() => onSearchChange('')}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      
      {/* Actions row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* View Mode Toggle */}
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(v) => v && onViewModeChange(v as 'grid' | 'list')}
        >
          <ToggleGroupItem 
            value="grid" 
            aria-label="Grid view" 
            className="h-10 w-10 sm:h-9 sm:w-9 p-0 touch-manipulation"
          >
            <Grid3X3 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="list" 
            aria-label="List view" 
            className="h-10 w-10 sm:h-9 sm:w-9 p-0 touch-manipulation"
          >
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Refresh */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation" 
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Refresh</TooltipContent>
        </Tooltip>

        {/* New Folder */}
        <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 sm:h-9 gap-1.5 touch-manipulation"
                >
                  <FolderPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Folder</span>
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="sm:hidden">New Folder</TooltipContent>
          </Tooltip>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-4">
              <Input
                placeholder="Folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="h-10 touch-manipulation"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setFolderDialogOpen(false)}
                  className="h-10 touch-manipulation"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateFolder} 
                  disabled={!folderName.trim()}
                  className="h-10 touch-manipulation"
                >
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="default" 
              size="sm" 
              className="h-10 sm:h-9 gap-1.5 touch-manipulation" 
              onClick={onUploadClick}
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="sm:hidden">Upload</TooltipContent>
        </Tooltip>

        {/* Delete Selected */}
        {selectedCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-10 sm:h-9 gap-1.5 touch-manipulation"
                onClick={onDeleteSelected}
                disabled={isDeleting}
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
      </div>
    </div>
  );
}
