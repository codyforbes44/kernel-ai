import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CodeConventions } from '@/types/knowledge-base';

interface ConventionsEditorProps {
  conventions: CodeConventions;
  onUpdate: (conventions: Partial<CodeConventions>) => void;
  onAddRule: (rule: string) => void;
  onRemoveRule: (index: number) => void;
}

export function ConventionsEditor({
  conventions,
  onUpdate,
  onAddRule,
  onRemoveRule,
}: ConventionsEditorProps) {
  const [newRule, setNewRule] = useState('');

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    onAddRule(newRule.trim());
    setNewRule('');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">
          Define coding conventions for consistency. The AI will follow these patterns.
        </Label>
      </div>

      {/* Predefined conventions */}
      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium">Component Naming</Label>
          <Input
            value={conventions.componentNaming}
            onChange={(e) => onUpdate({ componentNaming: e.target.value })}
            placeholder="e.g., PascalCase (UserProfileCard)"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs font-medium">File Naming</Label>
          <Input
            value={conventions.fileNaming}
            onChange={(e) => onUpdate({ fileNaming: e.target.value })}
            placeholder="e.g., kebab-case (user-profile-card.tsx)"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs font-medium">State Management</Label>
          <Input
            value={conventions.stateManagement}
            onChange={(e) => onUpdate({ stateManagement: e.target.value })}
            placeholder="e.g., TanStack Query for server, Zustand for client"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs font-medium">Styling Approach</Label>
          <Input
            value={conventions.styling}
            onChange={(e) => onUpdate({ styling: e.target.value })}
            placeholder="e.g., Tailwind CSS only, no inline styles"
            className="mt-1"
          />
        </div>
      </div>

      {/* Custom rules */}
      <div className="pt-3 border-t border-border">
        <Label className="text-xs font-medium">Custom Rules</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
            placeholder="Add a custom rule..."
            className="flex-1"
          />
          <Button size="icon" onClick={handleAddRule} disabled={!newRule.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 space-y-2">
          {conventions.customRules.map((rule, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm"
            >
              <span className="flex-1">{rule}</span>
              <button
                onClick={() => onRemoveRule(index)}
                className="hover:bg-destructive/20 rounded p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {conventions.customRules.length === 0 && (
            <p className="text-xs text-muted-foreground">No custom rules added</p>
          )}
        </div>
      </div>
    </div>
  );
}
