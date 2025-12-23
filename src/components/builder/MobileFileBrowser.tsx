import { memo, useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import type { FileTreeNode, ProjectFile } from '@/types/builder';
import { getFileIcon } from '@/types/builder';
import { hapticFeedback } from '@/hooks/useHaptic';

interface MobileFileBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: ProjectFile[];
  fileTree: FileTreeNode[];
  activeFileId: string | null;
  onFileSelect: (file: ProjectFile) => void;
  projectName?: string;
}

interface MobileTreeItemProps {
  node: FileTreeNode;
  level: number;
  files: ProjectFile[];
  activeFileId: string | null;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onFileClick: (file: ProjectFile) => void;
  searchQuery: string;
}

function MobileTreeItem({
  node,
  level,
  files,
  activeFileId,
  expandedFolders,
  onToggleFolder,
  onFileClick,
  searchQuery,
}: MobileTreeItemProps) {
  const isExpanded = expandedFolders.has(node.path);
  const isActive = node.id === activeFileId;
  const file = files.find(f => f.id === node.id);

  // Filter based on search
  const matchesSearch = searchQuery
    ? node.name.toLowerCase().includes(searchQuery.toLowerCase())
    : true;

  // If searching and this node doesn't match, check children
  const hasMatchingChildren = searchQuery && node.children?.some(child => 
    child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (child.type === 'folder' && hasMatchingDescendants(child, searchQuery))
  );

  if (searchQuery && !matchesSearch && !hasMatchingChildren) {
    return null;
  }

  const handleClick = () => {
    hapticFeedback('light');
    if (node.type === 'folder') {
      onToggleFolder(node.path);
    } else if (file) {
      onFileClick(file);
    }
  };

  return (
    <div>
      <button
        className={cn(
          'flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-all',
          'active:scale-[0.98] touch-manipulation text-left',
          'min-h-[48px]', // 48px touch target
          isActive
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'hover:bg-muted/50 active:bg-muted'
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-5 w-5 shrink-0 text-yellow-500" />
            ) : (
              <Folder className="h-5 w-5 shrink-0 text-yellow-500" />
            )}
          </>
        ) : (
          <>
            <span className="w-5" />
            <span className="text-base">{getFileIcon(node.name, 'file')}</span>
          </>
        )}
        <span className={cn(
          'truncate text-sm font-medium',
          isActive && 'text-primary'
        )}>
          {node.name}
        </span>
      </button>

      {node.type === 'folder' && (isExpanded || searchQuery) && node.children && (
        <div>
          {node.children.map(child => (
            <MobileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              files={files}
              activeFileId={activeFileId}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onFileClick={onFileClick}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function hasMatchingDescendants(node: FileTreeNode, query: string): boolean {
  if (!node.children) return false;
  return node.children.some(child => 
    child.name.toLowerCase().includes(query.toLowerCase()) ||
    (child.type === 'folder' && hasMatchingDescendants(child, query))
  );
}

export const MobileFileBrowser = memo(function MobileFileBrowser({
  open,
  onOpenChange,
  files,
  fileTree,
  activeFileId,
  onFileSelect,
  projectName = 'Project',
}: MobileFileBrowserProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/src', '/src/components']));
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleFileClick = useCallback((file: ProjectFile) => {
    hapticFeedback('medium');
    onFileSelect(file);
    onOpenChange(false);
  }, [onFileSelect, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85vw] max-w-[350px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">{projectName}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          
          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="py-2 pb-safe">
            {fileTree.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No files yet
              </div>
            ) : (
              fileTree.map(node => (
                <MobileTreeItem
                  key={node.id}
                  node={node}
                  level={0}
                  files={files}
                  activeFileId={activeFileId}
                  expandedFolders={expandedFolders}
                  onToggleFolder={toggleFolder}
                  onFileClick={handleFileClick}
                  searchQuery={searchQuery}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
});
