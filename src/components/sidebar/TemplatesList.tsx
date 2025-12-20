import { useState, useRef } from 'react';
import { useTemplates } from '@/hooks/useTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TemplateEditorDialog } from '@/components/dialogs/TemplateEditorDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { ShareTemplateDialog } from '@/components/dialogs/ShareTemplateDialog';
import { ImportFromCodeDialog } from '@/components/dialogs/ImportFromCodeDialog';
import type { PromptTemplate, TemplateCategory } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
  StarOff,
  FileText,
  Download,
  Upload,
  MoreVertical,
  Share2,
  Link,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplatesListProps {
  onSelectTemplate?: (content: string) => void;
}

interface ExportedTemplate {
  name: string;
  description: string | null;
  content: string;
  category: TemplateCategory;
  variables: string[];
  is_favorite: boolean;
}

const categoryColors: Record<TemplateCategory, string> = {
  debug: 'bg-red-500/10 text-red-500',
  component: 'bg-blue-500/10 text-blue-500',
  database: 'bg-green-500/10 text-green-500',
  edge_function: 'bg-purple-500/10 text-purple-500',
  rls: 'bg-yellow-500/10 text-yellow-500',
  performance: 'bg-orange-500/10 text-orange-500',
  ui_ux: 'bg-pink-500/10 text-pink-500',
  refactor: 'bg-cyan-500/10 text-cyan-500',
  docs: 'bg-indigo-500/10 text-indigo-500',
  custom: 'bg-muted text-muted-foreground',
};

const validCategories: TemplateCategory[] = [
  'debug', 'component', 'database', 'edge_function', 'rls',
  'performance', 'ui_ux', 'refactor', 'docs', 'custom'
];

export function TemplatesList({ onSelectTemplate }: TemplatesListProps) {
  const { templates, createTemplate, updateTemplate, deleteTemplate, loading, refresh } = useTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<PromptTemplate | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [templateToShare, setTemplateToShare] = useState<PromptTemplate | null>(null);
  const [importCodeDialogOpen, setImportCodeDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export templates to JSON file
  const handleExport = () => {
    if (templates.length === 0) {
      toast.error('No templates to export');
      return;
    }

    const exportData: ExportedTemplate[] = templates.map(t => ({
      name: t.name,
      description: t.description,
      content: t.content,
      category: t.category,
      variables: t.variables || [],
      is_favorite: t.is_favorite || false,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `templates-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${templates.length} templates`);
  };

  // Import templates from JSON file
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the data structure
      if (!Array.isArray(data)) {
        throw new Error('Invalid format: expected an array of templates');
      }

      let imported = 0;
      let skipped = 0;

      for (const item of data) {
        // Validate required fields
        if (!item.name || !item.content) {
          skipped++;
          continue;
        }

        // Validate category
        const category = validCategories.includes(item.category) ? item.category : 'custom';

        // Check for duplicate names
        const exists = templates.some(t => t.name.toLowerCase() === item.name.toLowerCase());
        if (exists) {
          skipped++;
          continue;
        }

        await createTemplate({
          name: item.name,
          description: item.description || null,
          content: item.content,
          category,
          variables: Array.isArray(item.variables) ? item.variables : [],
        });
        imported++;
      }

      await refresh();

      if (imported > 0) {
        toast.success(`Imported ${imported} template${imported !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} skipped)` : ''}`);
      } else {
        toast.info('No new templates imported (all duplicates or invalid)');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import templates. Please check the file format.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Import from share code
  const handleImportFromCode = async (template: {
    name: string;
    description: string | null;
    content: string;
    category: TemplateCategory;
    variables: string[];
  }) => {
    // Check for duplicate names
    const exists = templates.some(t => t.name.toLowerCase() === template.name.toLowerCase());
    if (exists) {
      // Append a number to make it unique
      template.name = `${template.name} (imported)`;
    }

    await createTemplate(template);
    await refresh();
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const favoriteTemplates = filteredTemplates.filter(t => t.is_favorite);
  const otherTemplates = filteredTemplates.filter(t => !t.is_favorite);

  const handleSave = async (data: Partial<PromptTemplate>) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, data);
        toast.success('Template updated');
      } else {
        await createTemplate(data as any);
        toast.success('Template created');
      }
    } catch {
      toast.error('Failed to save template');
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    try {
      await deleteTemplate(templateToDelete.id);
      toast.success('Template deleted');
    } catch {
      toast.error('Failed to delete template');
    }
  };

  const handleToggleFavorite = async (template: PromptTemplate) => {
    try {
      await updateTemplate(template.id, { is_favorite: !template.is_favorite });
    } catch {
      toast.error('Failed to update template');
    }
  };

  const handleUseTemplate = (template: PromptTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template.content);
      toast.success('Template inserted');
    }
  };

  const renderTemplate = (template: PromptTemplate) => (
    <div
      key={template.id}
      className="group p-3 rounded-lg border border-border/50 hover:border-border bg-card/50 hover:bg-card cursor-pointer transition-colors"
      onClick={() => handleUseTemplate(template)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-sm truncate">{template.name}</span>
            {template.is_favorite && (
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 shrink-0" />
            )}
          </div>
          {template.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className={cn('text-xs', categoryColors[template.category])}>
              {template.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Used {template.usage_count || 0} times
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              setEditingTemplate(template);
              setEditorOpen(true);
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(template);
            }}>
              {template.is_favorite ? (
                <>
                  <StarOff className="h-4 w-4 mr-2" />
                  Unfavorite
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Favorite
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              setTemplateToShare(template);
              setShareDialogOpen(true);
            }}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setTemplateToDelete(template);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-3 animate-fade-in">
        {/* Search skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 flex-1" delay={0} />
          <Skeleton className="h-8 w-8 rounded" delay={50} />
          <Skeleton className="h-8 w-8 rounded" delay={100} />
        </div>
        
        {/* Favorites section skeleton */}
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3 rounded" delay={150} />
            <Skeleton className="h-3 w-16" delay={175} />
          </div>
          {[0, 1].map((i) => (
            <div key={`fav-${i}`} className="p-3 rounded-lg border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" delay={200 + i * 100} />
                <Skeleton className="h-4 flex-1" delay={225 + i * 100} />
                <Skeleton className="h-3 w-3 rounded" delay={250 + i * 100} />
              </div>
              <Skeleton className="h-3 w-3/4" delay={275 + i * 100} />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" delay={300 + i * 100} />
                <Skeleton className="h-3 w-20" delay={325 + i * 100} />
              </div>
            </div>
          ))}
        </div>
        
        {/* All templates section skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" delay={450} />
          {[0, 1, 2].map((i) => (
            <div key={`tpl-${i}`} className="p-3 rounded-lg border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" delay={500 + i * 100} />
                <Skeleton className="h-4 flex-1" delay={525 + i * 100} />
              </div>
              <Skeleton className="h-3 w-2/3" delay={550 + i * 100} />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" delay={575 + i * 100} />
                <Skeleton className="h-3 w-16" delay={600 + i * 100} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {/* Search and Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              onClick={() => {
                setEditingTemplate(null);
                setEditorOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create template</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isImporting}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>More actions</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setImportCodeDialogOpen(true)}>
              <Link className="h-4 w-4 mr-2" />
              Import from code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Import from file
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExport} disabled={templates.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export all templates
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Templates List */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="space-y-4 pr-2">
          {favoriteTemplates.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Star className="h-3 w-3" />
                Favorites
              </h4>
              <div className="space-y-2">
                {favoriteTemplates.map(renderTemplate)}
              </div>
            </div>
          )}

          {otherTemplates.length > 0 && (
            <div className="space-y-2">
              {favoriteTemplates.length > 0 && (
                <h4 className="text-xs font-medium text-muted-foreground">All Templates</h4>
              )}
              <div className="space-y-2">
                {otherTemplates.map(renderTemplate)}
              </div>
            </div>
          )}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No templates found</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setEditingTemplate(null);
                  setEditorOpen(true);
                }}
              >
                Create your first template
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Dialogs */}
      <TemplateEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={editingTemplate}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Template"
        description={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />

      <ShareTemplateDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        template={templateToShare}
      />

      <ImportFromCodeDialog
        open={importCodeDialogOpen}
        onOpenChange={setImportCodeDialogOpen}
        onImport={handleImportFromCode}
      />
    </div>
  );
}
