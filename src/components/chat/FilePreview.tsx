import { X, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UploadedFile } from '@/hooks/useFileUpload';

interface FilePreviewProps {
  files: UploadedFile[];
  onRemove: (index: number) => void;
  className?: string;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type === 'application/pdf' || type.startsWith('text/')) return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreview({ files, onRemove, className }: FilePreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2 p-2', className)}>
      {files.map((file, index) => {
        const Icon = getFileIcon(file.type);
        const isImage = file.type.startsWith('image/');

        return (
          <div
            key={file.path}
            className="relative group flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50"
          >
            {isImage ? (
              <img
                src={file.url}
                alt={file.name}
                className="h-10 w-10 object-cover rounded"
              />
            ) : (
              <Icon className="h-5 w-5 text-muted-foreground" />
            )}
            
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium truncate max-w-[120px]">
                {file.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 absolute -top-1.5 -right-1.5 bg-background border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
