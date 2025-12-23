import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ImportMethod, MigrationPlatform, DetectionResult } from '@/lib/migration-data';
import { ShareCodeData } from '@/hooks/useMigrationWizard';
import { cn } from '@/lib/utils';
import { Upload, FileCode, FolderOpen, Link, Github, Check, AlertCircle, Loader2, Sparkles, Files, Settings, Palette, Share2, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

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
  detectionResult?: DetectionResult | null;
  isAnalyzing?: boolean;
  shareCode?: string;
  onShareCodeChange?: (code: string) => void;
  shareCodeData?: ShareCodeData | null;
  shareCodeError?: string | null;
  isLookingUpShareCode?: boolean;
  onLookupShareCode?: (code: string) => void;
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
  detectionResult,
  isAnalyzing,
  shareCode = '',
  onShareCodeChange,
  shareCodeData,
  shareCodeError,
  isLookingUpShareCode,
  onLookupShareCode,
}: FileUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isConnectingGitHub, setIsConnectingGitHub] = useState(false);
  const [gitHubConnected, setGitHubConnected] = useState(false);

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
                
                {/* Detection Results */}
                {isAnalyzing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing project files...
                  </motion.div>
                ) : detectionResult ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 space-y-3"
                  >
                    {/* Platform Detection */}
                    {detectionResult.platform && (
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant={detectionResult.confidence === 'high' ? 'default' : 'secondary'}>
                          <Sparkles className="w-3 h-3 mr-1" />
                          {detectionResult.confidence === 'high' ? 'Detected' : 'Likely'}: {detectionResult.platform.name}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Framework & Stats */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {detectionResult.detectedFramework && (
                        <Badge variant="outline">
                          <FileCode className="w-3 h-3 mr-1" />
                          {detectionResult.detectedFramework}
                        </Badge>
                      )}
                      {detectionResult.fileStats.components > 0 && (
                        <Badge variant="outline">
                          <Files className="w-3 h-3 mr-1" />
                          {detectionResult.fileStats.components} components
                        </Badge>
                      )}
                      {detectionResult.fileStats.configs > 0 && (
                        <Badge variant="outline">
                          <Settings className="w-3 h-3 mr-1" />
                          {detectionResult.fileStats.configs} configs
                        </Badge>
                      )}
                      {detectionResult.fileStats.styles > 0 && (
                        <Badge variant="outline">
                          <Palette className="w-3 h-3 mr-1" />
                          {detectionResult.fileStats.styles} styles
                        </Badge>
                      )}
                    </div>
                    
                    {/* Matched Patterns */}
                    {detectionResult.matchedPatterns.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Identified: </span>
                        {detectionResult.matchedPatterns.slice(0, 3).join(', ')}
                        {detectionResult.matchedPatterns.length > 3 && ` +${detectionResult.matchedPatterns.length - 3} more`}
                      </div>
                    )}
                  </motion.div>
                ) : detectedFramework ? (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm">
                    <FileCode className="w-4 h-4" />
                    Detected: {detectedFramework}
                  </div>
                ) : null}
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
    const handleConnectGitHub = async () => {
      setIsConnectingGitHub(true);
      // Open GitHub OAuth in a popup - for now just simulate
      window.open('/auth?provider=github', '_blank', 'width=600,height=700');
      // In a real implementation, we'd listen for the OAuth callback
      setTimeout(() => {
        setIsConnectingGitHub(false);
        setGitHubConnected(true);
      }, 2000);
    };

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
          {gitHubConnected ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">GitHub Connected</h3>
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
                <Button onClick={handleConnectGitHub} disabled={isConnectingGitHub}>
                  {isConnectingGitHub && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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

  if (method === 'shareCode') {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Enter Share Code or URL</h2>
          <p className="text-muted-foreground">
            Paste a Lovable project URL or template share code
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto space-y-4"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={shareCode}
                onChange={(e) => onShareCodeChange?.(e.target.value)}
                placeholder="https://lovable.dev/projects/... or share code"
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && shareCode.trim()) {
                    onLookupShareCode?.(shareCode);
                  }
                }}
              />
            </div>
            <Button 
              onClick={() => onLookupShareCode?.(shareCode)}
              disabled={!shareCode.trim() || isLookingUpShareCode}
            >
              {isLookingUpShareCode ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Look up'
              )}
            </Button>
          </div>

          {shareCodeError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="w-4 h-4" />
              {shareCodeError}
            </motion.div>
          )}

          {shareCodeData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-primary/50 bg-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {shareCodeData.type === 'project' ? (
                    <ExternalLink className="w-6 h-6 text-primary" />
                  ) : (
                    <FileText className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="default" className="text-xs">
                      {shareCodeData.type === 'project' ? 'Project' : 'Template'}
                    </Badge>
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  {shareCodeData.type === 'project' ? (
                    <>
                      <h4 className="font-medium truncate">Lovable Project</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {shareCodeData.projectUrl}
                      </p>
                    </>
                  ) : shareCodeData.template && (
                    <>
                      <h4 className="font-medium truncate">{shareCodeData.template.template_name}</h4>
                      {shareCodeData.template.template_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {shareCodeData.template.template_description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {shareCodeData.template.template_category}
                        </Badge>
                        {shareCodeData.template.template_variables && shareCodeData.template.template_variables.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {shareCodeData.template.template_variables.length} variables
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>Examples:</p>
            <p className="font-mono text-xs mt-1">https://lovable.dev/projects/abc123</p>
            <p className="font-mono text-xs">xK9mP2nQ</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
