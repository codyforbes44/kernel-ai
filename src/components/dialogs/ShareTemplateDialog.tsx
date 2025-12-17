import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Copy, Check, Share2 } from 'lucide-react';
import { templateSharingService } from '@/services/templateSharingService';
import { useAuth } from '@/hooks/useAuth';
import type { PromptTemplate } from '@/types/database';

interface ShareTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: PromptTemplate | null;
}

export function ShareTemplateDialog({
  open,
  onOpenChange,
  template,
}: ShareTemplateDialogProps) {
  const { user } = useAuth();
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setShareCode(null);
      setCopied(false);
    }
  }, [open]);

  const handleShare = async () => {
    if (!template || !user) return;

    setIsLoading(true);
    try {
      const { shareCode: code, error } = await templateSharingService.shareTemplate(
        user.id,
        {
          name: template.name,
          description: template.description,
          content: template.content,
          category: template.category,
          variables: template.variables || [],
        }
      );

      if (error) {
        toast.error('Failed to share template');
        return;
      }

      setShareCode(code);
      toast.success('Share code generated!');
    } catch (error) {
      toast.error('Failed to share template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareCode) return;

    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Template
          </DialogTitle>
          <DialogDescription>
            {shareCode
              ? 'Share this code with others so they can import your template.'
              : `Generate a shareable code for "${template?.name}". The code expires in 30 days.`}
          </DialogDescription>
        </DialogHeader>

        {shareCode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Share Code</Label>
              <div className="flex gap-2">
                <Input
                  value={shareCode}
                  readOnly
                  className="font-mono text-lg tracking-wider text-center"
                />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Others can import this template using the "Import from code" option.
            </p>
          </div>
        ) : (
          <div className="py-4">
            <div className="rounded-lg border border-border p-4 bg-muted/30">
              <p className="font-medium text-sm">{template?.name}</p>
              {template?.description && (
                <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Category: {template?.category}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {shareCode ? (
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleShare} disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Share Code'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
