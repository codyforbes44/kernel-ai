import { useState } from 'react';
import { Database, Table2, Shield, Zap, Copy, Check, ChevronDown, ChevronRight, Play, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';

export interface GeneratedTable {
  name: string;
  description: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    default?: string;
  }[];
}

export interface RLSPolicy {
  table: string;
  name: string;
  operation: string;
  description: string;
}

export interface Trigger {
  name: string;
  table: string;
  description: string;
}

export interface GeneratedSchema {
  sql: string;
  tables: GeneratedTable[];
  rlsPolicies: RLSPolicy[];
  triggers: Trigger[];
  thinking: string;
}

interface SchemaPreviewProps {
  schema: GeneratedSchema;
  onApply?: () => void;
  onCopy?: () => void;
  isApplying?: boolean;
  error?: string;
}

export function SchemaPreview({ 
  schema, 
  onApply, 
  onCopy, 
  isApplying = false,
  error,
}: SchemaPreviewProps) {
  const [showSQL, setShowSQL] = useState(false);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(schema.tables.map(t => t.name)));
  const { copied, copy } = useClipboard({ successMessage: 'SQL copied to clipboard' });

  const handleCopy = async () => {
    await copy(schema.sql);
    onCopy?.();
  };

  const toggleTable = (name: string) => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Generated Schema</span>
          <Badge variant="secondary" className="text-xs">
            {schema.tables.length} table{schema.tables.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowSQL(!showSQL)}
          >
            {showSQL ? 'Hide SQL' : 'Show SQL'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="p-3 space-y-3">
          {/* Thinking */}
          {schema.thinking && (
            <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
              {schema.thinking}
            </div>
          )}

          {/* Tables */}
          {schema.tables.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Table2 className="h-3.5 w-3.5" />
                Tables
              </div>
              {schema.tables.map((table) => (
                <Collapsible
                  key={table.name}
                  open={expandedTables.has(table.name)}
                  onOpenChange={() => toggleTable(table.name)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-2">
                        {expandedTables.has(table.name) ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        <span className="font-mono text-sm">{table.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {table.columns.length} cols
                      </Badge>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-1 ml-5 space-y-1">
                      <p className="text-xs text-muted-foreground mb-2">{table.description}</p>
                      {table.columns.map((col) => (
                        <div
                          key={col.name}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-background"
                        >
                          <span className="font-mono">{col.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs font-mono">
                              {col.type}
                            </Badge>
                            {!col.nullable && (
                              <Badge variant="destructive" className="text-xs">NOT NULL</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}

          {/* RLS Policies */}
          {schema.rlsPolicies.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                RLS Policies ({schema.rlsPolicies.length})
              </div>
              <div className="space-y-1">
                {schema.rlsPolicies.map((policy, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs p-2 rounded bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">{policy.table}:</span>
                      <span>{policy.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {policy.operation}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Triggers */}
          {schema.triggers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Zap className="h-3.5 w-3.5" />
                Triggers ({schema.triggers.length})
              </div>
              <div className="space-y-1">
                {schema.triggers.map((trigger, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs p-2 rounded bg-muted/30"
                  >
                    <div>
                      <span className="font-mono">{trigger.name}</span>
                      <span className="text-muted-foreground ml-2">on {trigger.table}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw SQL */}
          {showSQL && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">SQL Migration</div>
              <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
                {schema.sql}
              </pre>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-2 rounded bg-destructive/10 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      {onApply && (
        <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-border bg-muted/30">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={onApply}
            disabled={isApplying}
          >
            {isApplying ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Applying...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Apply Migration
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
