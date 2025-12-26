import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Keyboard } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
      { keys: ['⌘', '?'], description: 'Show keyboard shortcuts' },
      { keys: ['⌘', ','], description: 'Open settings' },
    ],
  },
  {
    category: 'Conversations',
    items: [
      { keys: ['⌘', 'N'], description: 'New conversation' },
      { keys: ['⌘', '⇧', 'N'], description: 'New project' },
      { keys: ['⌘', 'Enter'], description: 'Send message' },
      { keys: ['Esc'], description: 'Stop generating' },
    ],
  },
  {
    category: 'Preview',
    items: [
      { keys: ['1'], description: 'Desktop view' },
      { keys: ['2'], description: 'Tablet view' },
      { keys: ['3'], description: 'Mobile view' },
    ],
  },
  {
    category: 'Editor',
    items: [
      { keys: ['⌘', 'D'], description: 'Toggle dark mode' },
      { keys: ['⌘', '/'], description: 'Insert template' },
    ],
  },
];

export function KeyboardShortcutsModal({
  open,
  onOpenChange,
}: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              A list of keyboard shortcuts for navigation, conversations, preview, and editor actions.
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {shortcuts.map((section, i) => (
            <div key={section.category}>
              {i > 0 && <Separator className="mb-4" />}
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, index) => (
                        <kbd
                          key={index}
                          className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
