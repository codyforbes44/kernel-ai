import { cn } from '@/lib/utils';
import { PROJECT_TEMPLATES, ProjectTemplate } from '@/lib/projectTemplates';
import { Check } from 'lucide-react';

interface TemplatePickerProps {
  selectedId: string;
  onSelect: (template: ProjectTemplate) => void;
}

export function TemplatePicker({ selectedId, onSelect }: TemplatePickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto p-1">
      {PROJECT_TEMPLATES.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className={cn(
            'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all',
            'hover:border-primary/50 hover:bg-muted/50',
            selectedId === template.id
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card'
          )}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: `${template.color}20` }}
          >
            {template.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{template.name}</h4>
              {selectedId === template.id && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {template.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
