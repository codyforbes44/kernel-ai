import { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Relationship } from '@/types/database-editor';

interface RelationshipDiagramProps {
  relationships: Relationship[];
  selectedTable: string | null;
  onSelectTable: (tableName: string) => void;
  isLoading: boolean;
}

export function RelationshipDiagram({
  relationships,
  selectedTable,
  onSelectTable,
  isLoading,
}: RelationshipDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  // Filter relationships for selected table
  const relevantRelationships = selectedTable
    ? relationships.filter(
        (r) => r.sourceTable === selectedTable || r.targetTable === selectedTable
      )
    : relationships;

  // Generate Mermaid diagram code
  const generateMermaidCode = () => {
    if (relevantRelationships.length === 0) {
      return 'erDiagram\n    NO_RELATIONSHIPS';
    }

    const lines = ['erDiagram'];

    // Get unique tables
    const tables = new Set<string>();
    relevantRelationships.forEach((r) => {
      tables.add(r.sourceTable);
      tables.add(r.targetTable);
    });

    // Add relationships
    relevantRelationships.forEach((r) => {
      lines.push(`    ${r.sourceTable} ||--o{ ${r.targetTable} : "${r.sourceColumn}"`);
    });

    return lines.join('\n');
  };

  useEffect(() => {
    const loadMermaid = async () => {
      try {
        const mermaid = await import('mermaid');
        mermaid.default.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
        });
        setMermaidLoaded(true);
      } catch (error) {
        console.error('Failed to load mermaid:', error);
      }
    };

    loadMermaid();
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!mermaidLoaded || !containerRef.current) return;

      try {
        const mermaid = await import('mermaid');
        const code = generateMermaidCode();
        
        // Clear previous content
        containerRef.current.innerHTML = '';

        // Create a unique ID for this render
        const id = `mermaid-${Date.now()}`;

        const { svg } = await mermaid.default.render(id, code);
        containerRef.current.innerHTML = svg;

        // Add click handlers to table nodes
        const nodes = containerRef.current.querySelectorAll('.entityBox');
        nodes.forEach((node) => {
          node.addEventListener('click', () => {
            const text = node.querySelector('text')?.textContent;
            if (text && text !== 'NO_RELATIONSHIPS') {
              onSelectTable(text);
            }
          });
          (node as HTMLElement).style.cursor = 'pointer';
        });
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = '<div class="text-muted-foreground text-center p-8">Failed to render diagram</div>';
        }
      }
    };

    renderDiagram();
  }, [mermaidLoaded, relevantRelationships, selectedTable, onSelectTable]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (relationships.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
        <p>No relationships found</p>
        <p className="text-xs mt-1">Tables may not have foreign key constraints defined</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border bg-card flex items-center justify-between">
        <span className="text-sm font-medium">
          Entity Relationships
          {selectedTable && (
            <span className="text-muted-foreground ml-2">
              (showing connections for {selectedTable})
            </span>
          )}
        </span>
        {selectedTable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectTable('')}
          >
            Show All
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 min-h-[400px]">
          <div
            ref={containerRef}
            className="mermaid-container [&_svg]:max-w-full [&_.entityBox]:fill-card [&_.entityBox]:stroke-border [&_text]:fill-foreground"
          />
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Click on a table to filter relationships</span>
          <span className="flex items-center gap-1">
            <span className="w-8 h-0.5 bg-foreground" />
            Foreign Key
          </span>
        </div>
      </div>
    </div>
  );
}
