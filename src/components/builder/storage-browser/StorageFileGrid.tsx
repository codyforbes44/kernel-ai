import { StorageFile } from '@/services/storageService';
import { storageService } from '@/services/storageService';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Folder, 
  FileImage, 
  FileText, 
  File, 
  Download, 
  Trash2, 
  Copy, 
  Eye,
  FileJson,
  FileCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface StorageFileGridProps {
  files: StorageFile[];
  viewMode: 'grid' | 'list';
  selectedFiles: Set<string>;
  onToggleSelect: (path: string) => void;
  onNavigateToFolder: (name: string) => void;
  onPreview: (file: StorageFile) => void;
  onCopyUrl: (path: string) => void;
  onDownload: (file: StorageFile) => void;
  onDelete: (path: string) => void;
  getFileUrl: (path: string) => string;
}

function getFileIcon(file: StorageFile) {
  if (file.isFolder) return <Folder className="h-8 w-8 text-primary" />;
  
  if (storageService.isImageFile(file.mimeType)) {
    return <FileImage className="h-8 w-8 text-green-500" />;
  }
  if (storageService.isPdfFile(file.mimeType)) {
    return <FileText className="h-8 w-8 text-red-500" />;
  }
  if (file.mimeType === 'application/json') {
    return <FileJson className="h-8 w-8 text-yellow-500" />;
  }
  if (storageService.isTextFile(file.mimeType)) {
    return <FileCode className="h-8 w-8 text-blue-500" />;
  }
  return <File className="h-8 w-8 text-muted-foreground" />;
}

function FileContextMenu({
  file,
  onPreview,
  onCopyUrl,
  onDownload,
  onDelete,
  children,
}: {
  file: StorageFile;
  onPreview: () => void;
  onCopyUrl: () => void;
  onDownload: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {!file.isFolder && (
          <>
            <ContextMenuItem onClick={onPreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </ContextMenuItem>
            <ContextMenuItem onClick={onCopyUrl}>
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </ContextMenuItem>
            <ContextMenuItem onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function StorageFileGrid({
  files,
  viewMode,
  selectedFiles,
  onToggleSelect,
  onNavigateToFolder,
  onPreview,
  onCopyUrl,
  onDownload,
  onDelete,
  getFileUrl,
}: StorageFileGridProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Folder className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">No files found</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-24">Size</TableHead>
            <TableHead className="w-40">Modified</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map(file => (
            <FileContextMenu
              key={file.path}
              file={file}
              onPreview={() => onPreview(file)}
              onCopyUrl={() => onCopyUrl(file.path)}
              onDownload={() => onDownload(file)}
              onDelete={() => onDelete(file.path)}
            >
              <TableRow
                className={cn(
                  'cursor-pointer',
                  selectedFiles.has(file.path) && 'bg-primary/5'
                )}
                onDoubleClick={() => {
                  if (file.isFolder) {
                    onNavigateToFolder(file.name);
                  } else {
                    onPreview(file);
                  }
                }}
              >
                <TableCell>
                  {!file.isFolder && (
                    <Checkbox
                      checked={selectedFiles.has(file.path)}
                      onCheckedChange={() => onToggleSelect(file.path)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="shrink-0 scale-75">{getFileIcon(file)}</div>
                    <span className="truncate">{file.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {file.isFolder ? '-' : storageService.formatFileSize(file.size)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {file.updatedAt ? format(new Date(file.updatedAt), 'MMM d, yyyy') : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!file.isFolder && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopyUrl(file.path);
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownload(file);
                          }}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            </FileContextMenu>
          ))}
        </TableBody>
      </Table>
    );
  }

  // Grid view
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {files.map(file => (
        <FileContextMenu
          key={file.path}
          file={file}
          onPreview={() => onPreview(file)}
          onCopyUrl={() => onCopyUrl(file.path)}
          onDownload={() => onDownload(file)}
          onDelete={() => onDelete(file.path)}
        >
          <div
            className={cn(
              'group relative flex flex-col items-center gap-2 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 cursor-pointer transition-colors',
              selectedFiles.has(file.path) && 'border-primary bg-primary/5'
            )}
            onDoubleClick={() => {
              if (file.isFolder) {
                onNavigateToFolder(file.name);
              } else {
                onPreview(file);
              }
            }}
          >
            {!file.isFolder && (
              <Checkbox
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100"
                checked={selectedFiles.has(file.path)}
                onCheckedChange={() => onToggleSelect(file.path)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            
            {/* Thumbnail or Icon */}
            <div className="w-16 h-16 flex items-center justify-center">
              {!file.isFolder && storageService.isImageFile(file.mimeType) ? (
                <img
                  src={getFileUrl(file.path)}
                  alt={file.name}
                  className="max-w-full max-h-full object-contain rounded"
                  loading="lazy"
                />
              ) : (
                getFileIcon(file)
              )}
            </div>
            
            {/* Name */}
            <div className="w-full text-center">
              <p className="text-xs font-medium truncate" title={file.name}>
                {file.name}
              </p>
              {!file.isFolder && (
                <p className="text-[10px] text-muted-foreground">
                  {storageService.formatFileSize(file.size)}
                </p>
              )}
            </div>
          </div>
        </FileContextMenu>
      ))}
    </div>
  );
}
