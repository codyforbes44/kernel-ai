import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FilePlus, 
  FileEdit, 
  FileX, 
  ChevronDown, 
  ChevronRight,
  Loader2,
  GitCompare,
  FileCode
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DeploymentDiffViewerProps {
  projectId: string;
  lastDeployedAt?: string;
}

interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  currentContent?: string;
  previousContent?: string;
}

export function DeploymentDiffViewer({ projectId, lastDeployedAt }: DeploymentDiffViewerProps) {
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  // Fetch current project files
  const { data: currentFiles, isLoading: loadingCurrent } = useQuery({
    queryKey: ['project-files-current', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_files')
        .select('path, content, updated_at')
        .eq('project_id', projectId)
        .eq('type', 'file');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch files from last deployment (via file_versions)
  const { data: deployedFiles, isLoading: loadingDeployed } = useQuery({
    queryKey: ['project-files-deployed', projectId, lastDeployedAt],
    queryFn: async () => {
      if (!lastDeployedAt) return [];
      
      // Get file versions that existed at the time of last deployment
      const { data, error } = await supabase
        .from('file_versions')
        .select(`
          content,
          created_at,
          file_id,
          project_files!inner(path, project_id)
        `)
        .eq('project_files.project_id', projectId)
        .lte('created_at', lastDeployedAt)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get the latest version for each file before deployment
      const latestVersions = new Map<string, { path: string; content: string }>();
      data?.forEach((version: any) => {
        const path = version.project_files?.path;
        if (path && !latestVersions.has(path)) {
          latestVersions.set(path, { path, content: version.content });
        }
      });
      
      return Array.from(latestVersions.values());
    },
    enabled: !!lastDeployedAt,
  });

  // Calculate diff between current and deployed files
  const fileChanges = useMemo(() => {
    if (!currentFiles) return [];
    
    const changes: FileChange[] = [];
    const currentMap = new Map(currentFiles.map(f => [f.path, f.content || '']));
    const deployedMap = new Map(deployedFiles?.map(f => [f.path, f.content]) || []);

    // Check for added and modified files
    currentMap.forEach((content, path) => {
      if (!deployedMap.has(path)) {
        changes.push({ path, type: 'added', currentContent: content });
      } else if (deployedMap.get(path) !== content) {
        changes.push({ 
          path, 
          type: 'modified', 
          currentContent: content,
          previousContent: deployedMap.get(path)
        });
      }
    });

    // Check for deleted files
    deployedMap.forEach((content, path) => {
      if (!currentMap.has(path)) {
        changes.push({ path, type: 'deleted', previousContent: content });
      }
    });

    return changes.sort((a, b) => {
      const typeOrder = { deleted: 0, modified: 1, added: 2 };
      return typeOrder[a.type] - typeOrder[b.type] || a.path.localeCompare(b.path);
    });
  }, [currentFiles, deployedFiles]);

  const isLoading = loadingCurrent || loadingDeployed;

  const getChangeIcon = (type: FileChange['type']) => {
    switch (type) {
      case 'added':
        return <FilePlus className="h-3.5 w-3.5 text-success" />;
      case 'modified':
        return <FileEdit className="h-3.5 w-3.5 text-primary" />;
      case 'deleted':
        return <FileX className="h-3.5 w-3.5 text-destructive" />;
    }
  };

  const getChangeBadge = (type: FileChange['type']) => {
    const styles = {
      added: 'bg-success/20 text-success',
      modified: 'bg-primary/20 text-primary',
      deleted: 'bg-destructive/20 text-destructive',
    };
    return styles[type];
  };

  const renderDiff = (change: FileChange) => {
    const current = change.currentContent || '';
    const previous = change.previousContent || '';
    
    if (change.type === 'added') {
      return (
        <div className="text-xs font-mono">
          {current.split('\n').slice(0, 20).map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 text-muted-foreground text-right pr-2 select-none border-r border-border mr-2">
                {i + 1}
              </span>
              <span className="text-success bg-success/10 flex-1 whitespace-pre overflow-x-auto">
                + {line}
              </span>
            </div>
          ))}
          {current.split('\n').length > 20 && (
            <div className="text-muted-foreground text-center py-1">
              ... {current.split('\n').length - 20} more lines
            </div>
          )}
        </div>
      );
    }

    if (change.type === 'deleted') {
      return (
        <div className="text-xs font-mono">
          {previous.split('\n').slice(0, 20).map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 text-muted-foreground text-right pr-2 select-none border-r border-border mr-2">
                {i + 1}
              </span>
              <span className="text-destructive bg-destructive/10 flex-1 whitespace-pre overflow-x-auto">
                - {line}
              </span>
            </div>
          ))}
          {previous.split('\n').length > 20 && (
            <div className="text-muted-foreground text-center py-1">
              ... {previous.split('\n').length - 20} more lines
            </div>
          )}
        </div>
      );
    }

    // For modified files, show a simple line-by-line diff
    const currentLines = current.split('\n');
    const previousLines = previous.split('\n');
    const diffLines: { line: string; type: 'same' | 'added' | 'removed'; lineNum: number }[] = [];
    
    // Simple diff algorithm
    let i = 0, j = 0;
    while (i < previousLines.length || j < currentLines.length) {
      if (i >= previousLines.length) {
        diffLines.push({ line: currentLines[j], type: 'added', lineNum: j + 1 });
        j++;
      } else if (j >= currentLines.length) {
        diffLines.push({ line: previousLines[i], type: 'removed', lineNum: i + 1 });
        i++;
      } else if (previousLines[i] === currentLines[j]) {
        diffLines.push({ line: currentLines[j], type: 'same', lineNum: j + 1 });
        i++;
        j++;
      } else {
        diffLines.push({ line: previousLines[i], type: 'removed', lineNum: i + 1 });
        diffLines.push({ line: currentLines[j], type: 'added', lineNum: j + 1 });
        i++;
        j++;
      }
      
      if (diffLines.length > 50) break;
    }

    return (
      <div className="text-xs font-mono">
        {diffLines.slice(0, 50).map((d, i) => (
          <div key={i} className="flex">
            <span className="w-8 text-muted-foreground text-right pr-2 select-none border-r border-border mr-2">
              {d.lineNum}
            </span>
            <span 
              className={cn(
                "flex-1 whitespace-pre overflow-x-auto",
                d.type === 'added' && "text-success bg-success/10",
                d.type === 'removed' && "text-destructive bg-destructive/10 line-through",
                d.type === 'same' && "text-muted-foreground"
              )}
            >
              {d.type === 'added' && '+ '}
              {d.type === 'removed' && '- '}
              {d.type === 'same' && '  '}
              {d.line}
            </span>
          </div>
        ))}
        {diffLines.length > 50 && (
          <div className="text-muted-foreground text-center py-1">
            ... more changes
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (fileChanges.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground">
        <FileCode className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No changes detected since last deployment</p>
      </div>
    );
  }

  const addedCount = fileChanges.filter(f => f.type === 'added').length;
  const modifiedCount = fileChanges.filter(f => f.type === 'modified').length;
  const deletedCount = fileChanges.filter(f => f.type === 'deleted').length;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center gap-2 text-xs">
        <GitCompare className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Changes:</span>
        {addedCount > 0 && (
          <Badge className="bg-success/20 text-success text-[10px] px-1.5">
            +{addedCount} added
          </Badge>
        )}
        {modifiedCount > 0 && (
          <Badge className="bg-primary/20 text-primary text-[10px] px-1.5">
            ~{modifiedCount} modified
          </Badge>
        )}
        {deletedCount > 0 && (
          <Badge className="bg-destructive/20 text-destructive text-[10px] px-1.5">
            -{deletedCount} deleted
          </Badge>
        )}
      </div>

      {/* File list */}
      <ScrollArea className="max-h-[300px]">
        <div className="space-y-1">
          {fileChanges.map((change) => (
            <div key={change.path} className="rounded-md overflow-hidden border border-border">
              <button
                className="w-full flex items-center gap-2 p-2 hover:bg-muted/50 transition-colors text-left"
                onClick={() => setExpandedFile(expandedFile === change.path ? null : change.path)}
              >
                {expandedFile === change.path ? (
                  <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
                {getChangeIcon(change.type)}
                <span className="text-xs truncate flex-1">{change.path}</span>
                <Badge className={cn("text-[10px] px-1.5", getChangeBadge(change.type))}>
                  {change.type}
                </Badge>
              </button>
              
              {expandedFile === change.path && (
                <div className="border-t border-border bg-muted/30 p-2 overflow-x-auto">
                  {renderDiff(change)}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
