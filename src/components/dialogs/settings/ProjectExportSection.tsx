import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, FileJson, Loader2 } from 'lucide-react';
import { useExportProject } from '@/services/exportService';

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string | null;
  type: 'file' | 'folder';
}

interface ProjectExportSectionProps {
  project: {
    name: string;
    description?: string | null;
    template?: string | null;
    framework?: string | null;
    is_public?: boolean | null;
  } | null;
  files: ProjectFile[];
  disabled?: boolean;
}

export function ProjectExportSection({
  project,
  files,
  disabled = false,
}: ProjectExportSectionProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'zip' | 'json'>('zip');
  const { exportAsZip, exportAsJson } = useExportProject();

  const handleExport = async () => {
    if (!project || files.length === 0) return;

    setIsExporting(true);
    try {
      const projectMetadata = {
        name: project.name,
        description: project.description,
        template: project.template,
        framework: project.framework,
        isPublic: project.is_public ?? false,
      };

      if (exportFormat === 'zip') {
        await exportAsZip(projectMetadata, files);
      } else {
        exportAsJson(projectMetadata, files);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const fileCount = files.filter(f => f.type === 'file').length;
  const isDisabled = disabled || isExporting || files.length === 0;

  return (
    <div className="space-y-3">
      <Label>Export</Label>
      <div className="p-4 rounded-lg border border-border bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium">Download Project</p>
            <p className="text-sm text-muted-foreground">
              Export {fileCount} file{fileCount !== 1 ? 's' : ''} as a downloadable archive.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setExportFormat('json');
                handleExport();
              }}
              disabled={isDisabled}
              className="shrink-0"
              title="Export as JSON"
            >
              <FileJson className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setExportFormat('zip');
                handleExport();
              }}
              disabled={isDisabled}
              className="shrink-0"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? 'Exporting...' : 'ZIP'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
