import { useState } from 'react';
import { useTemplates } from '@/hooks/useTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TemplateEditorDialog } from '@/components/dialogs/TemplateEditorDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import type { PromptTemplate, TemplateCategory } from '@/types/database';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplatesListProps {
  onSelectTemplate?: (content: string) => void;
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

export function TemplatesList({ onSelectTemplate }: TemplatesListProps) {
  const { templates, createTemplate, updateTemplate, deleteTemplate, loading } = useTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<PromptTemplate | null>(null);

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
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search and Create */}
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
        <Button
          size="sm"
          onClick={() => {
            setEditingTemplate(null);
            setEditorOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
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
    </div>
  );
}
