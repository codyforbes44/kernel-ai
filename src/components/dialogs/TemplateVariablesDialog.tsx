import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { templateService } from '@/services/templateService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVariableHistory } from '@/hooks/useVariableHistory';
import { History, Variable } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BaseDialog, DialogActions } from './BaseDialog';

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
  const { getSuggestions, addMultipleToHistory } = useVariableHistory();

  useEffect(() => {
    if (open && templateContent) {
      const extractedVars = templateService.extractVariables(templateContent);
      setVariables(extractedVars);
      // Initialize with most recent history value or empty
      const initialValues: Record<string, string> = {};
      extractedVars.forEach((v) => {
        const suggestions = getSuggestions(v);
        initialValues[v] = suggestions[0] || '';
      });
      setValues(initialValues);
    }
  }, [open, templateContent, getSuggestions]);

  const handleApply = () => {
    // Save used values to history
    addMultipleToHistory(values);
    
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
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Fill Template Variables"
      description={
        <>
          {templateName && (
            <span className="block mb-1">
              Template: <Badge variant="secondary">{templateName}</Badge>
            </span>
          )}
          Enter values for the template variables below. You can skip to insert the template as-is.
        </>
      }
      icon={Variable}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleApply} disabled={!allFilled}>
            Apply Template
          </Button>
        </>
      }
    >
      <ScrollArea className="max-h-[300px] pr-4">
        <div className="space-y-4">
          {variables.map((variable) => {
            const suggestions = getSuggestions(variable);
            const hasSuggestions = suggestions.length > 0;

            return (
              <div key={variable} className="space-y-2">
                <Label htmlFor={variable} className="flex items-center gap-2">
                  {formatVariableName(variable)}
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {`{{${variable}}}`}
                  </code>
                </Label>
                <div className="flex gap-1">
                  <Input
                    id={variable}
                    placeholder={`Enter ${formatVariableName(variable).toLowerCase()}...`}
                    value={values[variable] || ''}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [variable]: e.target.value }))
                    }
                    className="flex-1"
                  />
                  {hasSuggestions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          title="Previous values"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          Recent values
                        </div>
                        {suggestions.map((suggestion, idx) => (
                          <DropdownMenuItem
                            key={idx}
                            onClick={() =>
                              setValues((prev) => ({ ...prev, [variable]: suggestion }))
                            }
                            className={cn(
                              "cursor-pointer",
                              values[variable] === suggestion && "bg-accent"
                            )}
                          >
                            <span className="truncate">{suggestion}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {/* Quick suggestion chips for first 3 values */}
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {suggestions.slice(0, 3).map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setValues((prev) => ({ ...prev, [variable]: suggestion }))
                        }
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full border transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          values[variable] === suggestion
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-muted/50 border-border text-muted-foreground"
                        )}
                      >
                        {suggestion.length > 20 ? suggestion.slice(0, 20) + '...' : suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </BaseDialog>
  );
}
