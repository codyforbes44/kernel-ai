import { Loader2, FilePlus, FileCode, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { hapticFeedback } from '@/hooks/useHaptic';

interface FileOperation {
  type: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
}

interface MobileOperationConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operations: FileOperation[];
  onApply: () => Promise<void>;
  isApplying: boolean;
}

function getOperationIcon(type: string) {
  switch (type) {
    case 'create': return <FilePlus className="h-4 w-4 text-success" />;
    case 'update': return <FileCode className="h-4 w-4 text-primary" />;
    case 'delete': return <Trash2 className="h-4 w-4 text-destructive" />;
    default: return <FileCode className="h-4 w-4" />;
  }
}

function getOperationBadgeVariant(type: string): 'default' | 'secondary' | 'destructive' {
  switch (type) {
    case 'create': return 'default';
    case 'delete': return 'destructive';
    default: return 'secondary';
  }
}

export function MobileOperationConfirm({
  open,
  onOpenChange,
  operations,
  onApply,
  isApplying,
}: MobileOperationConfirmProps) {
  const handleApply = async () => {
    hapticFeedback('medium');
    await onApply();
    onOpenChange(false);
  };

  const handleCancel = () => {
    hapticFeedback('light');
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="pb-2">
          <DrawerTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Apply {operations.length} Change{operations.length !== 1 ? 's' : ''}?
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <ScrollArea className="max-h-[40vh]">
            <div className="space-y-2">
              {operations.map((op, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  {getOperationIcon(op.type)}
                  <span className="text-sm font-mono truncate flex-1">
                    {op.path}
                  </span>
                  <Badge variant={getOperationBadgeVariant(op.type)} className="capitalize text-xs">
                    {op.type}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DrawerFooter className="pt-2">
          <Button
            onClick={handleApply}
            className="w-full h-12 text-base touch-manipulation"
            disabled={isApplying}
          >
            {isApplying ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Applying Changes...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Apply Changes
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full h-12 touch-manipulation"
            disabled={isApplying}
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
