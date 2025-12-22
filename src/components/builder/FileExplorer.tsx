import { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import type { FileTreeNode, ProjectFile } from '@/types/builder';
import { getFileIcon } from '@/types/builder';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileExplorerProps {
  files: ProjectFile[];
  fileTree: FileTreeNode[];
  activeFileId: string | null;
  onFileSelect: (file: ProjectFile) => void;
  onCreateFile: (path: string, name: string, type: 'file' | 'folder') => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string, newPath: string) => void;
  projectName?: string;
}

interface TreeItemProps {
  node: FileTreeNode;
  level: number;
  files: ProjectFile[];
  activeFileId: string | null;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onFileClick: (file: ProjectFile) => void;
  onCreateFile: (parentPath: string, type: 'file' | 'folder') => void;
  onRequestDelete: (node: FileTreeNode) => void;
  onRenameFile: (fileId: string, currentName: string) => void;
}

function TreeItem({
  node,
  level,
  files,
  activeFileId,
  expandedFolders,
  onToggleFolder,
  onFileClick,
  onCreateFile,
  onRequestDelete,
  onRenameFile,
}: TreeItemProps) {
  const isExpanded = expandedFolders.has(node.path);
  const isActive = node.id === activeFileId;
  const file = files.find(f => f.id === node.id);

  const handleClick = () => {
    if (node.type === 'folder') {
      onToggleFolder(node.path);
    } else if (file) {
      onFileClick(file);
    }
  };

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 cursor-pointer text-sm rounded-md transition-colors',
              'hover:bg-sidebar-accent',
              isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
            )}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={handleClick}
          >
            {node.type === 'folder' ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 shrink-0 text-yellow-500" />
                ) : (
                  <Folder className="h-4 w-4 shrink-0 text-yellow-500" />
                )}
              </>
            ) : (
              <>
                <span className="w-4" />
                <span className="text-sm">{getFileIcon(node.name, 'file')}</span>
              </>
            )}
            <span className="truncate text-sidebar-foreground">{node.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {node.type === 'folder' && (
            <>
              <ContextMenuItem onClick={() => onCreateFile(node.path, 'file')}>
                <File className="h-4 w-4 mr-2" />
                New File
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onCreateFile(node.path, 'folder')}>
                <Folder className="h-4 w-4 mr-2" />
                New Folder
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem onClick={() => onRenameFile(node.id, node.name)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => onRequestDelete(node)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              files={files}
              activeFileId={activeFileId}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onFileClick={onFileClick}
              onCreateFile={onCreateFile}
              onRequestDelete={onRequestDelete}
              onRenameFile={onRenameFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper to count items in a folder
function countFolderItems(node: FileTreeNode): number {
  if (node.type === 'file') return 1;
  let count = 1; // count the folder itself
  if (node.children) {
    for (const child of node.children) {
      count += countFolderItems(child);
    }
  }
  return count;
}

export function FileExplorer({
  files,
  fileTree,
  activeFileId,
  onFileSelect,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  projectName = 'Project',
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/src']));
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<FileTreeNode | null>(null);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [createParentPath, setCreateParentPath] = useState('/');
  const [newItemName, setNewItemName] = useState('');
  const [renameFileId, setRenameFileId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');

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

  const handleCreateFile = useCallback((parentPath: string, type: 'file' | 'folder') => {
    setCreateParentPath(parentPath);
    setCreateType(type);
    setNewItemName('');
    setShowCreateDialog(true);
  }, []);

  const handleRenameFile = useCallback((fileId: string, currentName: string) => {
    setRenameFileId(fileId);
    setRenameName(currentName);
    setShowRenameDialog(true);
  }, []);

  const handleRequestDelete = useCallback((node: FileTreeNode) => {
    setNodeToDelete(node);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (nodeToDelete) {
      onDeleteFile(nodeToDelete.id);
      setShowDeleteDialog(false);
      setNodeToDelete(null);
    }
  }, [nodeToDelete, onDeleteFile]);

  const confirmCreate = () => {
    if (!newItemName.trim()) return;
    
    const path = createParentPath === '/' 
      ? `/${newItemName}` 
      : `${createParentPath}/${newItemName}`;
    
    onCreateFile(path, newItemName, createType);
    setShowCreateDialog(false);
  };

  const confirmRename = () => {
    if (!renameName.trim() || !renameFileId) return;
    
    const file = files.find(f => f.id === renameFileId);
    if (!file) return;
    
    const parentPath = file.path.substring(0, file.path.lastIndexOf('/'));
    const newPath = parentPath ? `${parentPath}/${renameName}` : `/${renameName}`;
    
    onRenameFile(renameFileId, renameName, newPath);
    setShowRenameDialog(false);
  };

  // Calculate delete impact
  const deleteItemCount = nodeToDelete ? countFolderItems(nodeToDelete) : 0;
  const isFolder = nodeToDelete?.type === 'folder';

  return (
    <div className="h-full flex flex-col bg-sidebar-background border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {projectName}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleCreateFile('/', 'file')}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {fileTree.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No files yet.
              <br />
              Click + to create a file.
            </div>
          ) : (
            fileTree.map(node => (
              <TreeItem
                key={node.id}
                node={node}
                level={0}
                files={files}
                activeFileId={activeFileId}
                expandedFolders={expandedFolders}
                onToggleFolder={toggleFolder}
                onFileClick={onFileSelect}
                onCreateFile={handleCreateFile}
                onRequestDelete={handleRequestDelete}
                onRenameFile={handleRenameFile}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              New {createType === 'file' ? 'File' : 'Folder'}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={createType === 'file' ? 'filename.tsx' : 'folder-name'}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && confirmCreate()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <Input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete {isFolder ? 'Folder' : 'File'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete <strong>"{nodeToDelete?.name}"</strong>?
              </p>
              {isFolder && deleteItemCount > 1 && (
                <p className="text-destructive">
                  This folder contains {deleteItemCount - 1} item{deleteItemCount > 2 ? 's' : ''} that will also be deleted.
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNodeToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
