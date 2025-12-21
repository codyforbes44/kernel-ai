import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { TechStackItem } from '@/types/knowledge-base';

interface TechStackEditorProps {
  items: TechStackItem[];
  onAdd: (item: Omit<TechStackItem, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<TechStackItem>) => void;
  onRemove: (id: string) => void;
}

export function TechStackEditor({ items, onAdd, onRemove }: TechStackEditorProps) {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), version: version.trim() || undefined });
    setName('');
    setVersion('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">
          List the technologies used in this project. The AI will reference these when generating code.
        </Label>
      </div>

      {/* Add new tech */}
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Technology name (e.g., React)"
          className="flex-1"
        />
        <Input
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Version"
          className="w-24"
        />
        <Button size="icon" onClick={handleAdd} disabled={!name.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tech list */}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge
            key={item.id}
            variant="secondary"
            className="pl-3 pr-1.5 py-1.5 text-sm gap-1.5"
          >
            {item.name}
            {item.version && (
              <span className="text-muted-foreground">v{item.version}</span>
            )}
            <button
              onClick={() => onRemove(item.id)}
              className="ml-1 hover:bg-destructive/20 rounded p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No technologies added yet
          </p>
        )}
      </div>

      {/* Quick add suggestions */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
        <div className="flex flex-wrap gap-1.5">
          {['React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'TanStack Query', 'Zustand', 'Supabase'].map((tech) => (
            <Button
              key={tech}
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={() => onAdd({ name: tech })}
              disabled={items.some(item => item.name.toLowerCase() === tech.toLowerCase())}
            >
              + {tech}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
