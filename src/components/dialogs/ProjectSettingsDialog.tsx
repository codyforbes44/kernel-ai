import { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Globe, Lock, Trash2, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROJECT_TEMPLATES } from '@/lib/projectTemplates';
import { toast } from 'sonner';

// Framework options
const FRAMEWORKS = [
  { id: 'react', name: 'React', icon: '⚛️' },
  { id: 'react-ts', name: 'React + TypeScript', icon: '⚛️' },
  { id: 'vanilla', name: 'Vanilla JS', icon: '📜' },
  { id: 'vue', name: 'Vue', icon: '💚' },
];

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string | null;
  type: 'file' | 'folder';
}

interface ProjectSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    name: string;
    description?: string | null;
    is_public?: boolean | null;
    template?: string | null;
    framework?: string | null;
  } | null;
  files?: ProjectFile[];
  onSave: (updates: { name?: string; description?: string; is_public?: boolean; template?: string; framework?: string }) => Promise<void>;
  onDelete: () => void;
  isSaving?: boolean;
}

export function ProjectSettingsDialog({
  open,
  onOpenChange,
  project,
  files = [],
  onSave,
  onDelete,
  isSaving = false,
}: ProjectSettingsDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [template, setTemplate] = useState('blank');
  const [framework, setFramework] = useState('react');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLocalSaving, setIsLocalSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Sync state when project changes or dialog opens
  useEffect(() => {
    if (project && open) {
      setName(project.name || '');
      setDescription(project.description || '');
      setIsPublic(project.is_public || false);
      setTemplate(project.template || 'blank');
      setFramework(project.framework || 'react');
      setHasChanges(false);
    }
  }, [project, open]);

  // Track changes
  useEffect(() => {
    if (!project) return;
    const changed =
      name !== (project.name || '') ||
      description !== (project.description || '') ||
      isPublic !== (project.is_public || false) ||
      template !== (project.template || 'blank') ||
      framework !== (project.framework || 'react');
    setHasChanges(changed);
  }, [name, description, isPublic, template, framework, project]);

  const handleSave = useCallback(async () => {
    if (!project || !hasChanges) return;
    
    setIsLocalSaving(true);
    try {
      const updates: { name?: string; description?: string; is_public?: boolean; template?: string; framework?: string } = {};
      
      if (name !== project.name) updates.name = name;
      if (description !== (project.description || '')) updates.description = description;
      if (isPublic !== (project.is_public || false)) updates.is_public = isPublic;
      if (template !== (project.template || 'blank')) updates.template = template;
      if (framework !== (project.framework || 'react')) updates.framework = framework;
      
      await onSave(updates);
      setHasChanges(false);
    } finally {
      setIsLocalSaving(false);
    }
  }, [project, name, description, isPublic, template, framework, hasChanges, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && hasChanges && !isLocalSaving) {
      e.preventDefault();
      handleSave();
    }
  }, [hasChanges, isLocalSaving, handleSave]);

  const handleExport = useCallback(async () => {
    if (!project || files.length === 0) return;
    
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const projectFolder = zip.folder(project.name.replace(/[^a-zA-Z0-9-_]/g, '-'));
      
      if (!projectFolder) {
        throw new Error('Failed to create project folder');
      }

      // Add files to zip
      for (const file of files) {
        if (file.type === 'file' && file.content !== null) {
          // Remove leading slash from path
          const filePath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
          projectFolder.file(filePath, file.content);
        }
      }

      // Add a README with project info
      const readme = `# ${project.name}

${project.description || 'No description provided.'}

## Project Info
- **Template**: ${template}
- **Framework**: ${framework}
- **Visibility**: ${isPublic ? 'Public' : 'Private'}

## Getting Started
1. Install dependencies: \`npm install\`
2. Start the development server: \`npm run dev\`

---
Exported from Builder on ${new Date().toLocaleDateString()}
`;
      projectFolder.file('README.md', readme);

      // Generate and download
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.replace(/[^a-zA-Z0-9-_]/g, '-')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Project exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export project');
    } finally {
      setIsExporting(false);
    }
  }, [project, files, template, framework, isPublic]);

  const saving = isSaving || isLocalSaving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Configure your project's name, description, and visibility.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Project"
              disabled={saving}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your project..."
              rows={3}
              disabled={saving}
              className="resize-none"
            />
          </div>

          {/* Template & Framework */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-template">Template</Label>
              <Select value={template} onValueChange={setTemplate} disabled={saving}>
                <SelectTrigger id="project-template">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-2">
                        <span>{t.icon}</span>
                        <span>{t.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-framework">Framework</Label>
              <Select value={framework} onValueChange={setFramework} disabled={saving}>
                <SelectTrigger id="project-framework">
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  {FRAMEWORKS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      <span className="flex items-center gap-2">
                        <span>{f.icon}</span>
                        <span>{f.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="space-y-3">
            <Label>Visibility</Label>
            <div 
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-colors",
                isPublic 
                  ? "border-primary/50 bg-primary/5" 
                  : "border-border bg-muted/30"
              )}
            >
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <div className="p-2 rounded-full bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-muted">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {isPublic ? 'Public Project' : 'Private Project'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPublic 
                      ? 'Anyone can view and remix this project' 
                      : 'Only you can access this project'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                disabled={saving}
              />
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving || !name.trim()}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>

          <Separator />

          {/* Export Project */}
          <div className="space-y-3">
            <Label>Export</Label>
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Download as ZIP</p>
                  <p className="text-sm text-muted-foreground">
                    Export all project files as a downloadable ZIP archive.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={saving || isExporting || files.length === 0}
                  className="shrink-0"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <Label className="text-destructive font-semibold">Danger Zone</Label>
            </div>
            <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Delete Project</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this project and all its files. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  disabled={saving}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
