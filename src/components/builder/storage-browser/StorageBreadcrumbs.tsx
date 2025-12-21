import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StorageBreadcrumbsProps {
  currentBucket: string;
  pathParts: string[];
  onNavigateToPath: (path: string) => void;
}

export function StorageBreadcrumbs({
  currentBucket,
  pathParts,
  onNavigateToPath,
}: StorageBreadcrumbsProps) {
  return (
    <div className="flex items-center gap-1 text-sm overflow-x-auto py-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 shrink-0"
        onClick={() => onNavigateToPath('')}
      >
        <Home className="h-4 w-4 mr-1" />
        {currentBucket}
      </Button>
      
      {pathParts.map((part, index) => {
        const path = pathParts.slice(0, index + 1).join('/');
        const isLast = index === pathParts.length - 1;
        
        return (
          <div key={path} className="flex items-center shrink-0">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="px-2 font-medium">{part}</span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => onNavigateToPath(path)}
              >
                {part}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
