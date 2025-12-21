import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => onSearchChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <ToggleGroup 
        type="single" 
        value={viewMode} 
        onValueChange={(v) => v && onViewModeChange(v as 'grid' | 'list')}
      >
        <ToggleGroupItem value="grid" aria-label="Grid view" className="h-9 w-9 p-0">
          <Grid3X3 className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List view" className="h-9 w-9 p-0">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Button variant="outline" size="sm" className="h-9" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4" />
      </Button>

      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <FolderPlus className="h-4 w-4 mr-1.5" />
            New Folder
          </Button>
        </DialogTrigger>
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
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={!folderName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="default" size="sm" className="h-9" onClick={onUploadClick}>
        <Upload className="h-4 w-4 mr-1.5" />
        Upload
      </Button>

      {selectedCount > 0 && (
        <Button 
          variant="destructive" 
          size="sm" 
          className="h-9"
          onClick={onDeleteSelected}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Delete ({selectedCount})
        </Button>
      )}
    </div>
  );
}
