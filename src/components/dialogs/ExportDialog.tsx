import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { conversationService } from '@/services/conversationService';
import { toast } from 'sonner';
import { Download, FileJson, FileText } from 'lucide-react';
import { BaseDialog, DialogActions } from './BaseDialog';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  conversationTitle: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  conversationId,
  conversationTitle,
}: ExportDialogProps) {
  const [format, setFormat] = useState<'markdown' | 'json'>('markdown');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const content = await conversationService.export(conversationId, format);
      
      const blob = new Blob([content], {
        type: format === 'json' ? 'application/json' : 'text/markdown',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${conversationTitle.replace(/[^a-z0-9]/gi, '_')}.${format === 'json' ? 'json' : 'md'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Conversation exported successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to export conversation');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Export Conversation"
      description={`Choose a format to export "${conversationTitle}"`}
      icon={Download}
      size="sm"
      footer={
        <DialogActions
          onCancel={() => onOpenChange(false)}
          onConfirm={handleExport}
          confirmText="Export"
          loadingText="Exporting..."
          isLoading={isExporting}
        />
      }
    >
      <RadioGroup value={format} onValueChange={(v) => setFormat(v as 'markdown' | 'json')}>
        <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
          <RadioGroupItem value="markdown" id="markdown" />
          <Label htmlFor="markdown" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Markdown</div>
                <div className="text-xs text-muted-foreground">
                  Human-readable format, great for sharing
                </div>
              </div>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer mt-2">
          <RadioGroupItem value="json" id="json" />
          <Label htmlFor="json" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-3">
              <FileJson className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">JSON</div>
                <div className="text-xs text-muted-foreground">
                  Complete data export with metadata
                </div>
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </BaseDialog>
  );
}
