import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';
import { BaseDialog, DialogActions } from './BaseDialog';

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  currentName: string;
  onRename: (newName: string) => Promise<void>;
  type?: 'conversation' | 'project';
}

export function RenameDialog({
  open,
  onOpenChange,
  title,
  currentName,
  onRename,
  type = 'conversation',
}: RenameDialogProps) {
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  const handleSubmit = async () => {
    if (!name.trim() || name === currentName) return;

    setIsLoading(true);
    try {
      await onRename(name.trim());
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim() && name !== currentName && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={`Enter a new name for this ${type}.`}
      icon={Pencil}
      size="sm"
      footer={
        <DialogActions
          onCancel={() => onOpenChange(false)}
          onConfirm={handleSubmit}
          confirmText="Save"
          loadingText="Saving..."
          isLoading={isLoading}
          confirmDisabled={!name.trim()}
        />
      }
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Enter ${type} name`}
          autoFocus
        />
      </div>
    </BaseDialog>
  );
}
