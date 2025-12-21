import { StorageFile, storageService } from '@/services/storageService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Download, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StoragePreviewModalProps {
  file: StorageFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getFileUrl: (path: string) => string;
  onCopyUrl: (path: string) => void;
  onDownload: (file: StorageFile) => void;
  onDelete: (path: string) => void;
}

export function StoragePreviewModal({
  file,
  open,
  onOpenChange,
  getFileUrl,
  onCopyUrl,
  onDownload,
  onDelete,
}: StoragePreviewModalProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);

  useEffect(() => {
    if (!file || !open) {
      setTextContent(null);
      return;
    }

    // Load text content for text files
    if (storageService.isTextFile(file.mimeType)) {
      setIsLoadingText(true);
      fetch(getFileUrl(file.path))
        .then(res => res.text())
        .then(text => setTextContent(text))
        .catch(() => setTextContent('Failed to load file content'))
        .finally(() => setIsLoadingText(false));
    }
  }, [file, open, getFileUrl]);

  if (!file) return null;

  const fileUrl = getFileUrl(file.path);

  const renderPreview = () => {
    // Image preview
    if (storageService.isImageFile(file.mimeType)) {
      return (
        <div className="flex items-center justify-center min-h-[300px] bg-muted/30 rounded-lg">
          <img
            src={fileUrl}
            alt={file.name}
            className="max-w-full max-h-[60vh] object-contain"
          />
        </div>
      );
    }

    // PDF preview
    if (storageService.isPdfFile(file.mimeType)) {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-[60vh] rounded-lg border"
          title={file.name}
        />
      );
    }

    // Text/JSON preview
    if (storageService.isTextFile(file.mimeType)) {
      if (isLoadingText) {
        return (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        );
      }
      return (
        <ScrollArea className="h-[60vh] rounded-lg border bg-muted/30">
          <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
            {textContent}
          </pre>
        </ScrollArea>
      );
    }

    // Default - no preview available
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-muted/30 rounded-lg">
        <p className="text-muted-foreground mb-2">Preview not available</p>
        <p className="text-sm text-muted-foreground">
          File type: {file.mimeType}
        </p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span className="truncate">{file.name}</span>
            <span className="text-sm text-muted-foreground font-normal">
              {storageService.formatFileSize(file.size)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {renderPreview()}

          <div className="flex items-center justify-between gap-2 pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyUrl(file.path)}
              >
                <Copy className="h-4 w-4 mr-1.5" />
                Copy URL
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(file)}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Download
              </Button>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(file.path);
                onOpenChange(false);
              }}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
