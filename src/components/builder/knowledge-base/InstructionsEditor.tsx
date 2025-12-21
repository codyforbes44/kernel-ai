import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface InstructionsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function InstructionsEditor({ value, onChange }: InstructionsEditorProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-muted-foreground">
          Add custom instructions for the AI. These will be included in every prompt.
        </Label>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Example instructions:
• Always use TypeScript strict mode
• Prefer composition over inheritance
• Use shadcn/ui components when possible
• Add proper error handling to all async functions
• Include JSDoc comments for public APIs`}
        className="min-h-[200px] text-sm font-mono resize-none"
      />
      <p className="text-xs text-muted-foreground">
        {value.length} characters
      </p>
    </div>
  );
}
