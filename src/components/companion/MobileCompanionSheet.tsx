import { useState } from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CompanionSelector } from './CompanionSelector';

interface MobileCompanionSheetProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  trigger?: React.ReactNode;
}

export function MobileCompanionSheet({ selectedId, onSelect, trigger }: MobileCompanionSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Users className="h-4 w-4" />
      <span className="sr-only sm:not-sr-only">Select Companion</span>
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Companion
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="pb-6">
            <CompanionSelector 
              selectedId={selectedId} 
              onSelect={handleSelect} 
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
