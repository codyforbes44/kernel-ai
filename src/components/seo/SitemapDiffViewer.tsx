import { DiffLine } from "@/hooks/useSitemapDiff";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Equal } from "lucide-react";
import { cn } from "@/lib/utils";

interface SitemapDiffViewerProps {
  lines: DiffLine[];
  addedCount: number;
  removedCount: number;
}

export function SitemapDiffViewer({ lines, addedCount, removedCount }: SitemapDiffViewerProps) {
  const unchangedCount = lines.filter(l => l.type === 'unchanged').length;
  
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
          <Plus className="w-3 h-3 mr-1" />
          {addedCount} added
        </Badge>
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
          <Minus className="w-3 h-3 mr-1" />
          {removedCount} removed
        </Badge>
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
          <Equal className="w-3 h-3 mr-1" />
          {unchangedCount} unchanged
        </Badge>
      </div>
      
      {/* Diff View */}
      <ScrollArea className="h-[400px] rounded-lg border border-border bg-muted/20">
        <div className="p-4 font-mono text-sm">
          {lines.map((line, index) => (
            <div
              key={index}
              className={cn(
                "px-3 py-1 rounded-sm flex items-start gap-3",
                line.type === 'added' && "bg-emerald-500/10 text-emerald-400",
                line.type === 'removed' && "bg-red-500/10 text-red-400 line-through",
                line.type === 'unchanged' && "text-muted-foreground"
              )}
            >
              <span className="w-4 flex-shrink-0 text-right opacity-50">
                {line.type === 'added' && '+'}
                {line.type === 'removed' && '-'}
                {line.type === 'unchanged' && ' '}
              </span>
              <pre className="whitespace-pre-wrap break-all">{line.content}</pre>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
