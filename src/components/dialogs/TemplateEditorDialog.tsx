import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileEdit, FilePlus } from 'lucide-react';
import { templateService } from '@/services/templateService';
import { BaseDialog, DialogActions } from './BaseDialog';
import type { PromptTemplate, TemplateCategory } from '@/types/database';

interface TemplateEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: PromptTemplate | null;
  onSave: (template: Partial<PromptTemplate>) => Promise<void>;
}

const categories: { value: TemplateCategory; label: string }[] = [
  { value: 'debug', label: 'Debug' },
  { value: 'component', label: 'Component' },
  { value: 'database', label: 'Database' },
  { value: 'edge_function', label: 'Edge Function' },
  { value: 'rls', label: 'RLS' },
  { value: 'performance', label: 'Performance' },
  { value: 'ui_ux', label: 'UI/UX' },
  { value: 'refactor', label: 'Refactor' },
  { value: 'docs', label: 'Docs' },
  { value: 'custom', label: 'Custom' },
];

export function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: TemplateEditorDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('custom');
  const [isLoading, setIsLoading] = useState(false);

  const variables = templateService.extractVariables(content);
  const isEditing = !!template;

  useEffect(() => {
    if (open && template) {
      setName(template.name);
      setDescription(template.description || '');
      setContent(template.content);
      setCategory(template.category);
    } else if (open) {
      setName('');
      setDescription('');
      setContent('');
      setCategory('custom');
    }
  }, [open, template]);

  const handleSubmit = async () => {
    if (!name.trim() || !content.trim()) return;

    setIsLoading(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        content: content.trim(),
        category,
        variables,
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Template' : 'Create Template'}
      description="Use {{variable}} syntax to create placeholders."
      icon={isEditing ? FileEdit : FilePlus}
      size="lg"
      footer={
        <DialogActions
          onCancel={() => onOpenChange(false)}
          onConfirm={handleSubmit}
          confirmText="Save"
          loadingText="Saving..."
          isLoading={isLoading}
          confirmDisabled={!name.trim() || !content.trim()}
        />
      }
    >
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Template name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your template content..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        {variables.length > 0 && (
          <div className="space-y-2">
            <Label>Detected Variables</Label>
            <div className="flex flex-wrap gap-2">
              {variables.map((v) => (
                <Badge key={v} variant="secondary">
                  {v}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  );
}
