import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ImportMethod, MigrationPlatform } from '@/lib/migration-data';
import { cn } from '@/lib/utils';
import { Upload, FileCode, FolderOpen, Link, Github, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGitHub } from '@/hooks/useGitHub';

interface FileUploadStepProps {
  platform: MigrationPlatform;
  method: ImportMethod;
  files: File[];
  pastedCode: string;
  importUrl: string;
  detectedFramework: string | null;
  fileCount: number;
  onFilesChange: (files: File[]) => void;
  onPastedCodeChange: (code: string) => void;
  onImportUrlChange: (url: string) => void;
}

export function FileUploadStep({
  platform,
  method,
  files,
  pastedCode,
  importUrl,
  detectedFramework,
  fileCount,
  onFilesChange,
  onPastedCodeChange,
  onImportUrlChange,
}: FileUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { connection, isLoading: isConnecting } = useGitHub();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const items = Array.from(e.dataTransfer.files);
    if (items.length > 0) {
      onFilesChange(items);
    }
  }, [onFilesChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const items = Array.from(e.target.files || []);
    if (items.length > 0) {
      onFilesChange(items);
    }
  }, [onFilesChange]);

  if (method === 'zip') {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Upload Your Project</h2>
          <p className="text-muted-foreground">
            Drag and drop your ZIP file or select it from your computer
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'relative flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed transition-all duration-200',
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-border hover:border-primary/50 bg-card',
              files.length > 0 && 'border-primary/50 bg-primary/5'
            )}
          >
            <input
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {files.length > 0 ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{files[0].name}</h3>
                <p className="text-sm text-muted-foreground">
                  {(files[0].size / 1024 / 1024).toFixed(2)} MB
                </p>
                {detectedFramework && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm">
                    <FileCode className="w-4 h-4" />
                    Detected: {detectedFramework}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Drop your ZIP file here</h3>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <Button variant="outline" size="sm">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Select File
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (method === 'paste') {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Paste Your Code</h2>
          <p className="text-muted-foreground">
            Paste your component code from {platform.name}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Textarea
            value={pastedCode}
            onChange={(e) => onPastedCodeChange(e.target.value)}
            placeholder={`// Paste your ${platform.name} code here...\n\nimport React from 'react';\n\nexport default function Component() {\n  return (\n    <div>Hello World</div>\n  );\n}`}
            className="min-h-[300px] font-mono text-sm"
          />
          
          {pastedCode.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Check className="w-4 h-4 text-primary" />
              {pastedCode.split('\n').length} lines of code
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  if (method === 'url') {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Enter Project URL</h2>
          <p className="text-muted-foreground">
            Paste the URL of your {platform.name} project
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={importUrl}
              onChange={(e) => onImportUrlChange(e.target.value)}
              placeholder={platform.urlPattern ? `e.g., https://${platform.id}.dev/...` : 'https://...'}
              className="pl-10"
            />
          </div>

          {importUrl && !platform.urlPattern?.test(importUrl) && platform.urlPattern && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex items-center gap-2 text-sm text-amber-500"
            >
              <AlertCircle className="w-4 h-4" />
              This doesn't look like a valid {platform.name} URL
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  if (method === 'github') {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Connect GitHub</h2>
          <p className="text-muted-foreground">
            Import directly from your GitHub repository
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          {connection ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Connected as {connection.github_username}</h3>
                <p className="text-sm text-muted-foreground">
                  You can now select a repository to import
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Github className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">GitHub Not Connected</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your GitHub account to import repositories
                </p>
                <Button disabled={isConnecting}>
                  {isConnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Github className="w-4 h-4 mr-2" />
                  Connect GitHub
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return null;
}
