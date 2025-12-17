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
import { Badge } from '@/components/ui/badge';
import { templateService } from '@/services/templateService';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TemplateVariablesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateContent: string;
  templateName?: string;
  onApply: (content: string) => void;
}

export function TemplateVariablesDialog({
  open,
  onOpenChange,
  templateContent,
  templateName,
  onApply,
}: TemplateVariablesDialogProps) {
  const [variables, setVariables] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && templateContent) {
      const extractedVars = templateService.extractVariables(templateContent);
      setVariables(extractedVars);
      // Initialize empty values
      const initialValues: Record<string, string> = {};
      extractedVars.forEach((v) => {
        initialValues[v] = '';
      });
      setValues(initialValues);
    }
  }, [open, templateContent]);

  const handleApply = () => {
    const appliedContent = templateService.applyVariables(templateContent, values);
    onApply(appliedContent);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onApply(templateContent);
    onOpenChange(false);
  };

  const allFilled = variables.every((v) => values[v]?.trim());

  // Format variable name for display (snake_case to Title Case)
  const formatVariableName = (name: string) => {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fill Template Variables</DialogTitle>
          <DialogDescription>
            {templateName && (
              <span className="block mb-1">
                Template: <Badge variant="secondary">{templateName}</Badge>
              </span>
            )}
            Enter values for the template variables below. You can skip to insert the template as-is.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-4 py-2">
            {variables.map((variable) => (
              <div key={variable} className="space-y-2">
                <Label htmlFor={variable} className="flex items-center gap-2">
                  {formatVariableName(variable)}
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {`{{${variable}}}`}
                  </code>
                </Label>
                <Input
                  id={variable}
                  placeholder={`Enter ${formatVariableName(variable).toLowerCase()}...`}
                  value={values[variable] || ''}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [variable]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleApply} disabled={!allFilled}>
            Apply Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
