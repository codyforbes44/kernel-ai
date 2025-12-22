import { useState, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, FileArchive, Loader2, CheckCircle2, AlertCircle, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ExtractedFile {
  path: string;
  name: string;
  content: string;
  type: 'file' | 'folder';
}

interface ImportProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (name: string, files: ExtractedFile[]) => Promise<void>;
  isImporting?: boolean;
}

// File extensions we can handle as text
const TEXT_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.scss', '.sass', '.less',
  '.md', '.txt', '.xml', '.yaml', '.yml', '.toml', '.env', '.gitignore', '.npmrc',
  '.svg', '.vue', '.svelte', '.astro', '.py', '.rb', '.go', '.rs', '.java', '.php',
  '.sh', '.bash', '.zsh', '.ps1', '.bat', '.cmd', '.sql', '.graphql', '.prisma'
];

function isTextFile(filename: string): boolean {
  const lowerName = filename.toLowerCase();
  return TEXT_EXTENSIONS.some(ext => lowerName.endsWith(ext)) || 
         !filename.includes('.') || // Files without extension (like Dockerfile, Makefile)
         lowerName.startsWith('.');  // Dotfiles
}

export function ImportProjectDialog({
  open,
  onOpenChange,
  onImport,
  isImporting = false,
}: ImportProjectDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setProjectName('');
    setSelectedFile(null);
    setExtractedFiles([]);
    setIsExtracting(false);
    setExtractProgress(0);
    setError(null);
  }, []);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      resetState();
    }
    onOpenChange(newOpen);
  }, [onOpenChange, resetState]);

  const extractZip = useCallback(async (file: File) => {
    setIsExtracting(true);
    setError(null);
    setExtractProgress(0);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      const files: ExtractedFile[] = [];
      const entries = Object.entries(contents.files);
      let processed = 0;

      for (const [relativePath, zipEntry] of entries) {
        // Skip directories and hidden files like __MACOSX
        if (zipEntry.dir || relativePath.startsWith('__MACOSX') || relativePath.includes('/.')) {
          processed++;
          setExtractProgress((processed / entries.length) * 100);
          continue;
        }

        // Get just the filename
        const name = relativePath.split('/').pop() || relativePath;
        
        // Normalize path - remove root folder if all files are in one folder
        let normalizedPath = relativePath;
        
        // Check if it's a text file we can read
        if (isTextFile(name)) {
          try {
            const content = await zipEntry.async('string');
            files.push({
              path: '/' + normalizedPath,
              name,
              content,
              type: 'file',
            });
          } catch (e) {
            console.warn(`Failed to read ${relativePath}:`, e);
          }
        }

        processed++;
        setExtractProgress((processed / entries.length) * 100);
      }

      // Try to detect project name from package.json or folder structure
      const packageJson = files.find(f => f.name === 'package.json');
      if (packageJson) {
        try {
          const pkg = JSON.parse(packageJson.content);
          if (pkg.name && !projectName) {
            setProjectName(pkg.name);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      // If no name yet, use the zip filename
      if (!projectName) {
        const zipName = file.name.replace(/\.zip$/i, '');
        setProjectName(zipName);
      }

      // Normalize paths - if all files share a common root folder, strip it
      const allPaths = files.map(f => f.path);
      const commonPrefix = findCommonPrefix(allPaths);
      if (commonPrefix.length > 1 && commonPrefix.includes('/')) {
        const prefixToRemove = commonPrefix.substring(0, commonPrefix.lastIndexOf('/') + 1);
        files.forEach(f => {
          f.path = f.path.replace(prefixToRemove, '/');
        });
      }

      setExtractedFiles(files);
      setExtractProgress(100);
    } catch (e) {
      console.error('Failed to extract ZIP:', e);
      setError('Failed to extract ZIP file. Please ensure it\'s a valid ZIP archive.');
    } finally {
      setIsExtracting(false);
    }
  }, [projectName]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Please select a ZIP file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File is too large. Maximum size is 50MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    extractZip(file);
  }, [extractZip]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Please drop a ZIP file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File is too large. Maximum size is 50MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    extractZip(file);
  }, [extractZip]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleImport = useCallback(async () => {
    if (!projectName.trim() || extractedFiles.length === 0) return;
    
    try {
      await onImport(projectName.trim(), extractedFiles);
      handleOpenChange(false);
      toast.success(`Project "${projectName}" imported successfully!`);
    } catch (e) {
      console.error('Import failed:', e);
      toast.error('Failed to import project');
    }
  }, [projectName, extractedFiles, onImport, handleOpenChange]);

  const fileCount = extractedFiles.length;
  const isReady = extractedFiles.length > 0 && projectName.trim() && !isExtracting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Project from ZIP</DialogTitle>
          <DialogDescription>
            Upload a ZIP file containing your project files to create a new project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Drop Zone */}
          {!selectedFile && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                "hover:border-primary/50 hover:bg-muted/30",
                error ? "border-destructive/50 bg-destructive/5" : "border-border"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">Drop a ZIP file here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Maximum file size: 50MB</p>
            </div>
          )}

          {/* Selected File */}
          {selectedFile && (
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileArchive className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {isExtracting ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : extractedFiles.length > 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : error ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : null}
              </div>

              {isExtracting && (
                <div className="mt-3">
                  <Progress value={extractProgress} className="h-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Extracting files... {Math.round(extractProgress)}%
                  </p>
                </div>
              )}

              {extractedFiles.length > 0 && !isExtracting && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <File className="h-4 w-4" />
                  {fileCount} file{fileCount !== 1 ? 's' : ''} extracted
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Change File Button */}
          {selectedFile && !isExtracting && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedFile(null);
                setExtractedFiles([]);
                setError(null);
                fileInputRef.current?.click();
              }}
            >
              Choose Different File
            </Button>
          )}

          {/* Project Name */}
          {extractedFiles.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="import-project-name">Project Name</Label>
              <Input
                id="import-project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Imported Project"
                disabled={isImporting}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!isReady || isImporting}>
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to find common path prefix
function findCommonPrefix(paths: string[]): string {
  if (paths.length === 0) return '';
  if (paths.length === 1) return paths[0];

  let prefix = paths[0];
  for (let i = 1; i < paths.length; i++) {
    while (!paths[i].startsWith(prefix)) {
      prefix = prefix.substring(0, prefix.length - 1);
      if (prefix === '') return '';
    }
  }
  return prefix;
}
