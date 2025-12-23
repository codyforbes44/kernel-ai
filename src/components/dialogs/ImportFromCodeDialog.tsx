import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Download, Loader2 } from 'lucide-react';
import { templateSharingService, SharedTemplate } from '@/services/templateSharingService';
import { BaseDialog, DialogActions } from './BaseDialog';
import type { TemplateCategory } from '@/types/database';

interface ImportFromCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: {
    name: string;
    description: string | null;
    content: string;
    category: TemplateCategory;
    variables: string[];
  }) => Promise<void>;
}

export function ImportFromCodeDialog({
  open,
  onOpenChange,
  onImport,
}: ImportFromCodeDialogProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<SharedTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!code.trim()) {
      setError('Please enter a share code');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPreview(null);

    try {
      const { template, error: fetchError } = await templateSharingService.getByShareCode(code.trim());

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setPreview(template);
    } catch {
      setError('Failed to look up template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!preview) return;

    setIsImporting(true);
    try {
      await onImport({
        name: preview.template_name,
        description: preview.template_description,
        content: preview.template_content,
        category: preview.template_category as TemplateCategory,
        variables: preview.template_variables || [],
      });
      toast.success('Template imported successfully!');
      handleClose();
    } catch {
      toast.error('Failed to import template');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setPreview(null);
    setError(null);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !preview && code.trim()) {
      handleLookup();
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={handleClose}
      title="Import Template from Code"
      description="Enter a share code to import a template shared by another user."
      icon={Download}
      size="md"
      footer={
        <DialogActions
          onCancel={handleClose}
          onConfirm={handleImport}
          confirmText="Import Template"
          loadingText="Importing..."
          isLoading={isImporting}
          confirmDisabled={!preview}
        />
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="share-code">Share Code</Label>
          <div className="flex gap-2">
            <Input
              id="share-code"
              placeholder="e.g., ABC12345"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
                setPreview(null);
              }}
              onKeyDown={handleKeyDown}
              className="font-mono tracking-wider"
              maxLength={8}
            />
            <Button
              variant="outline"
              onClick={handleLookup}
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Look up'}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {preview && (
          <div className="rounded-lg border border-border p-4 bg-muted/30 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{preview.template_name}</p>
                {preview.template_description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {preview.template_description}
                  </p>
                )}
              </div>
              <Badge variant="secondary">{preview.template_category}</Badge>
            </div>
            <div className="text-xs font-mono bg-background/50 rounded p-2 max-h-24 overflow-auto">
              {preview.template_content.slice(0, 200)}
              {preview.template_content.length > 200 && '...'}
            </div>
            {preview.template_variables && preview.template_variables.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {preview.template_variables.map((v) => (
                  <Badge key={v} variant="outline" className="text-[10px] font-mono">
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </BaseDialog>
  );
}
