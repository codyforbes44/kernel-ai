import { useCallback, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface StorageUploadZoneProps {
  onUpload: (files: File[]) => Promise<unknown>;
  isUploading?: boolean;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export function StorageUploadZone({
  onUpload,
  isUploading,
  maxFileSize = 10 * 1024 * 1024,
  allowedTypes,
}: StorageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFiles = useCallback((files: File[]): File[] => {
    return files.filter(file => {
      if (file.size > maxFileSize) {
        return false;
      }
      if (allowedTypes && !allowedTypes.includes(file.type)) {
        return false;
      }
      return true;
    });
  }, [maxFileSize, allowedTypes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);
    
    if (validFiles.length > 0) {
      setPendingFiles(validFiles);
    }
  }, [validateFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = validateFiles(selectedFiles);
    
    if (validFiles.length > 0) {
      setPendingFiles(validFiles);
    }
    
    // Reset input
    e.target.value = '';
  }, [validateFiles]);

  const handleUpload = useCallback(async () => {
    if (pendingFiles.length > 0) {
      await onUpload(pendingFiles);
      setPendingFiles([]);
    }
  }, [pendingFiles, onUpload]);

  const removePendingFile = useCallback((index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-muted-foreground/50',
          isUploading && 'pointer-events-none opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept={allowedTypes?.join(',')}
        />
        
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max {formatSize(maxFileSize)} per file
            </p>
          </div>
        </div>
      </div>

      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Ready to upload ({pendingFiles.length} file{pendingFiles.length > 1 ? 's' : ''})
          </div>
          
          <div className="space-y-1 max-h-[120px] overflow-y-auto">
            {pendingFiles.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-2 p-2 rounded bg-muted/50 text-sm"
              >
                <span className="truncate flex-1">{file.name}</span>
                <span className="text-muted-foreground shrink-0">{formatSize(file.size)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePendingFile(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setPendingFiles([])}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${pendingFiles.length} file${pendingFiles.length > 1 ? 's' : ''}`}
            </Button>
          </div>

          {isUploading && (
            <Progress value={undefined} className="h-1" />
          )}
        </div>
      )}
    </div>
  );
}
