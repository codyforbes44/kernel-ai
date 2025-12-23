import { memo } from 'react';
import { cn } from '@/lib/utils';
import { panelRegistry, getPanelsByCategory, type PanelId } from '@/registry/panelRegistry';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { hapticFeedback } from '@/hooks/useHaptic';

interface MobilePanelDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activePanel: PanelId | null;
  onSelectPanel: (panel: PanelId) => void;
}

const categoryLabels = {
  ai: 'AI Tools',
  project: 'Project',
  cloud: 'Cloud',
  tools: 'Automation',
};

export const MobilePanelDrawer = memo(function MobilePanelDrawer({
  open,
  onOpenChange,
  activePanel,
  onSelectPanel,
}: MobilePanelDrawerProps) {
  const panelsByCategory = getPanelsByCategory();

  const handleSelectPanel = (panelId: PanelId) => {
    hapticFeedback('light');
    onSelectPanel(panelId);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex items-center justify-between border-b border-border pb-3">
          <DrawerTitle>Panels</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-6 pb-safe">
            {(Object.keys(panelsByCategory) as Array<keyof typeof panelsByCategory>).map((category) => {
              const panels = panelsByCategory[category];
              if (panels.length === 0) return null;
              
              return (
                <div key={category}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    {categoryLabels[category]}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {panels.map((panel) => {
                      const Icon = panel.icon;
                      const isActive = activePanel === panel.id;
                      
                      return (
                        <button
                          key={panel.id}
                          onClick={() => handleSelectPanel(panel.id)}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
                            'active:scale-95 touch-manipulation min-h-[88px]',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/50 hover:bg-muted text-foreground'
                          )}
                          aria-pressed={isActive}
                        >
                          <Icon className="h-6 w-6" />
                          <span className="text-xs font-medium text-center leading-tight">
                            {panel.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
});
