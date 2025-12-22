import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ProjectDangerZoneProps {
  onDelete: () => void;
  disabled?: boolean;
}

export function ProjectDangerZone({
  onDelete,
  disabled = false,
}: ProjectDangerZoneProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <Label className="text-destructive font-semibold">Danger Zone</Label>
      </div>
      <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Delete Project</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete this project and all its files. This action cannot be undone.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={disabled}
            className="shrink-0"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
