import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { OpenTab } from '@/types/builder';
import { getFileIcon } from '@/types/builder';

interface EditorTabsProps {
  tabs: OpenTab[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export function EditorTabs({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
}: EditorTabsProps) {
  if (tabs.length === 0) return null;

  return (
    <div className="h-10 bg-background border-b border-border flex-shrink-0">
      <ScrollArea className="w-full">
        <div className="flex h-10">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={cn(
                'group flex items-center gap-2 px-3 h-10 border-r border-border cursor-pointer',
                'hover:bg-muted/50 transition-colors',
                activeTabId === tab.id 
                  ? 'bg-background border-b-2 border-b-primary' 
                  : 'bg-muted/30'
              )}
              onClick={() => onTabSelect(tab.id)}
            >
              <span className="text-sm">{getFileIcon(tab.name, 'file')}</span>
              <span className="text-sm whitespace-nowrap">
                {tab.name}
                {tab.isDirty && <span className="text-primary ml-1">●</span>}
              </span>
              <button
                className={cn(
                  'ml-1 p-0.5 rounded hover:bg-destructive/20 transition-colors',
                  'opacity-0 group-hover:opacity-100',
                  activeTabId === tab.id && 'opacity-100'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
