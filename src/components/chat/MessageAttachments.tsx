import { FileText, Image, File, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Attachment {
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

interface MessageAttachmentsProps {
  attachments: Attachment[];
  isUser?: boolean;
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

export function MessageAttachments({ attachments, isUser }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((file) => {
        const Icon = getFileIcon(file.type);
        const isImage = file.type.startsWith('image/');

        if (isImage) {
          return (
            <a
              key={file.path}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative group"
            >
              <img
                src={file.url}
                alt={file.name}
                className="max-w-[200px] max-h-[200px] rounded-lg object-cover border border-border/50"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <ExternalLink className="h-5 w-5 text-white" />
              </div>
            </a>
          );
        }

        return (
          <a
            key={file.path}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
              isUser
                ? "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                : "bg-muted hover:bg-muted/80 border border-border/50"
            )}
          >
            <Icon className="h-4 w-4" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium truncate max-w-[150px]">
                {file.name}
              </span>
              <span className={cn(
                "text-xs",
                isUser ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {formatFileSize(file.size)}
              </span>
            </div>
            <Download className="h-3.5 w-3.5 ml-1" />
          </a>
        );
      })}
    </div>
  );
}
