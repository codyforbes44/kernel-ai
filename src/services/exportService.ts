import JSZip from 'jszip';
import { toast } from 'sonner';

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string | null;
  type: 'file' | 'folder';
}

interface ProjectMetadata {
  name: string;
  description?: string | null;
  template?: string | null;
  framework?: string | null;
  isPublic?: boolean;
}

interface ExportOptions {
  includeReadme?: boolean;
  onProgress?: (progress: number) => void;
}

interface ExportResult {
  success: boolean;
  fileName?: string;
  error?: string;
}

/**
 * Service for exporting projects to various formats.
 * Centralizes export logic from ProjectSettingsDialog.tsx
 */
export const exportService = {
  /**
   * Export project files as a ZIP archive
   */
  async exportAsZip(
    project: ProjectMetadata,
    files: ProjectFile[],
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    const { includeReadme = true, onProgress } = options;
    
    if (!project.name) {
      return { success: false, error: 'Project name is required' };
    }
    
    if (files.length === 0) {
      return { success: false, error: 'No files to export' };
    }
    
    try {
      const zip = new JSZip();
      const sanitizedName = project.name.replace(/[^a-zA-Z0-9-_]/g, '-');
      const projectFolder = zip.folder(sanitizedName);
      
      if (!projectFolder) {
        return { success: false, error: 'Failed to create project folder' };
      }

      // Filter and add files
      const fileList = files.filter(f => f.type === 'file' && f.content !== null);
      const totalFiles = fileList.length + (includeReadme ? 1 : 0);
      let processedFiles = 0;
      
      for (const file of fileList) {
        if (file.content !== null) {
          const filePath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
          projectFolder.file(filePath, file.content);
          processedFiles++;
          onProgress?.(Math.round((processedFiles / totalFiles) * 100));
        }
      }

      // Add README if requested
      if (includeReadme) {
        const readme = this.generateReadme(project);
        projectFolder.file('README.md', readme);
        processedFiles++;
        onProgress?.(100);
      }

      // Generate and download
      const blob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });
      
      this.downloadBlob(blob, `${sanitizedName}.zip`);
      
      return { success: true, fileName: `${sanitizedName}.zip` };
    } catch (error) {
      console.error('Export failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Export failed' 
      };
    }
  },

  /**
   * Export project metadata as JSON
   */
  exportAsJson(project: ProjectMetadata, files: ProjectFile[]): ExportResult {
    try {
      const exportData = {
        project: {
          name: project.name,
          description: project.description,
          template: project.template,
          framework: project.framework,
          exportedAt: new Date().toISOString(),
        },
        files: files
          .filter(f => f.type === 'file')
          .map(f => ({
            path: f.path,
            name: f.name,
            content: f.content,
          })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const sanitizedName = project.name.replace(/[^a-zA-Z0-9-_]/g, '-');
      this.downloadBlob(blob, `${sanitizedName}.json`);
      
      return { success: true, fileName: `${sanitizedName}.json` };
    } catch (error) {
      console.error('JSON export failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Export failed' 
      };
    }
  },

  /**
   * Generate README content for export
   */
  generateReadme(project: ProjectMetadata): string {
    return `# ${project.name}

${project.description || 'No description provided.'}

## Project Info
- **Template**: ${project.template || 'Custom'}
- **Framework**: ${project.framework || 'React'}
- **Visibility**: ${project.isPublic ? 'Public' : 'Private'}

## Getting Started
1. Install dependencies: \`npm install\`
2. Start the development server: \`npm run dev\`

---
Exported from Builder on ${new Date().toLocaleDateString()}
`;
  },

  /**
   * Download a blob as a file
   */
  downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

/**
 * Hook for using export service with toast notifications
 */
export function useExportProject() {
  const exportAsZip = async (
    project: ProjectMetadata,
    files: ProjectFile[],
    options?: ExportOptions
  ) => {
    const result = await exportService.exportAsZip(project, files, options);
    if (result.success) {
      toast.success('Project exported successfully!');
    } else {
      toast.error(result.error || 'Failed to export project');
    }
    return result;
  };

  const exportAsJson = (project: ProjectMetadata, files: ProjectFile[]) => {
    const result = exportService.exportAsJson(project, files);
    if (result.success) {
      toast.success('Project exported as JSON!');
    } else {
      toast.error(result.error || 'Failed to export project');
    }
    return result;
  };

  return { exportAsZip, exportAsJson };
}
