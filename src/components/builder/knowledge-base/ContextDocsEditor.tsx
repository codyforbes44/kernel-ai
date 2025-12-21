import { useState } from 'react';
import { Plus, Trash2, FileText, Code, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { ContextDocument } from '@/types/knowledge-base';

interface ContextDocsEditorProps {
  docs: ContextDocument[];
  onAdd: (doc: Omit<ContextDocument, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<ContextDocument>) => void;
  onRemove: (id: string) => void;
}

const docTypeIcons = {
  reference: FileText,
  example: Code,
  'api-doc': BookOpen,
};

const docTypeLabels = {
  reference: 'Reference',
  example: 'Example',
  'api-doc': 'API Doc',
};

export function ContextDocsEditor({ docs, onAdd, onUpdate, onRemove }: ContextDocsEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<ContextDocument['type']>('reference');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleAdd = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    onAdd({ title: newTitle.trim(), content: newContent.trim(), type: newType });
    setNewTitle('');
    setNewContent('');
    setNewType('reference');
    setIsAdding(false);
  };

  const toggleExpanded = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">
          Add reference documents, API specs, or code examples for the AI to reference.
        </Label>
      </div>

      {/* Document list */}
      <div className="space-y-2">
        {docs.map((doc) => {
          const Icon = docTypeIcons[doc.type];
          const isExpanded = expandedIds.has(doc.id);

          return (
            <Collapsible key={doc.id} open={isExpanded}>
              <div className="border border-border rounded-md overflow-hidden">
                <CollapsibleTrigger
                  className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpanded(doc.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="flex-1 text-left text-sm font-medium">{doc.title}</span>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                    {docTypeLabels[doc.type]}
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-3 pt-0 space-y-3">
                    <Input
                      value={doc.title}
                      onChange={(e) => onUpdate(doc.id, { title: e.target.value })}
                      placeholder="Document title"
                      className="text-sm"
                    />
                    <Textarea
                      value={doc.content}
                      onChange={(e) => onUpdate(doc.id, { content: e.target.value })}
                      placeholder="Document content..."
                      className="min-h-[100px] text-sm font-mono resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <Select
                        value={doc.type}
                        onValueChange={(value) => onUpdate(doc.id, { type: value as ContextDocument['type'] })}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reference">Reference</SelectItem>
                          <SelectItem value="example">Example</SelectItem>
                          <SelectItem value="api-doc">API Doc</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onRemove(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}

        {docs.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No context documents added yet
          </p>
        )}
      </div>

      {/* Add new document */}
      {isAdding ? (
        <div className="border border-border rounded-md p-3 space-y-3">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Document title"
            autoFocus
          />
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Document content (e.g., API endpoints, code examples, specifications)..."
            className="min-h-[120px] text-sm font-mono resize-none"
          />
          <div className="flex items-center justify-between">
            <Select value={newType} onValueChange={(value) => setNewType(value as ContextDocument['type'])}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reference">Reference</SelectItem>
                <SelectItem value="example">Example</SelectItem>
                <SelectItem value="api-doc">API Doc</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAdd} disabled={!newTitle.trim() || !newContent.trim()}>
                Add Document
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Context Document
        </Button>
      )}
    </div>
  );
}
