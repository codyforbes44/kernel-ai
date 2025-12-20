import { useState, useCallback } from "react";
import { generateSitemapXml } from "@/lib/sitemap";

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number;
}

export interface SitemapDiff {
  current: string;
  generated: string;
  lines: DiffLine[];
  hasChanges: boolean;
  addedCount: number;
  removedCount: number;
}

function computeDiff(current: string, generated: string): DiffLine[] {
  const currentLines = current.trim().split('\n');
  const generatedLines = generated.trim().split('\n');
  const result: DiffLine[] = [];
  
  const maxLength = Math.max(currentLines.length, generatedLines.length);
  
  // Simple line-by-line diff
  const currentSet = new Set(currentLines.map(l => l.trim()));
  const generatedSet = new Set(generatedLines.map(l => l.trim()));
  
  let lineNumber = 1;
  
  // Find removed lines (in current but not in generated)
  currentLines.forEach(line => {
    const trimmed = line.trim();
    if (!generatedSet.has(trimmed)) {
      result.push({ type: 'removed', content: line, lineNumber: lineNumber++ });
    }
  });
  
  // Reset line number for generated content
  lineNumber = 1;
  
  // Process generated lines
  generatedLines.forEach(line => {
    const trimmed = line.trim();
    if (!currentSet.has(trimmed)) {
      result.push({ type: 'added', content: line, lineNumber: lineNumber++ });
    } else {
      result.push({ type: 'unchanged', content: line, lineNumber: lineNumber++ });
    }
  });
  
  // Sort by type for better visualization (removed first, then unchanged, then added)
  return result.sort((a, b) => {
    const order = { removed: 0, unchanged: 1, added: 2 };
    return order[a.type] - order[b.type];
  });
}

export function useSitemapDiff() {
  const [diff, setDiff] = useState<SitemapDiff | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compareSitemap = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch current sitemap.xml
      const response = await fetch('/sitemap.xml');
      if (!response.ok) {
        throw new Error('Failed to fetch current sitemap.xml');
      }
      const current = await response.text();
      
      // Generate new sitemap from routes
      const generated = generateSitemapXml();
      
      // Compute diff
      const lines = computeDiff(current, generated);
      const addedCount = lines.filter(l => l.type === 'added').length;
      const removedCount = lines.filter(l => l.type === 'removed').length;
      
      setDiff({
        current,
        generated,
        lines,
        hasChanges: addedCount > 0 || removedCount > 0,
        addedCount,
        removedCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearDiff = useCallback(() => {
    setDiff(null);
    setError(null);
  }, []);

  return {
    diff,
    isLoading,
    error,
    compareSitemap,
    clearDiff,
  };
}
