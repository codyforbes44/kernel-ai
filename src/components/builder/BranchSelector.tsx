import { useState } from 'react';
import { GitBranch, Plus, Loader2, Check, ChevronDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface Branch {
  name: string;
  isDefault: boolean;
  isProtected: boolean;
}

interface BranchSelectorProps {
  currentBranch: string;
  branches: Branch[];
  isLoading: boolean;
  isSwitching: boolean;
  isCreating: boolean;
  hasUnsavedChanges?: boolean;
  onLoadBranches: () => Promise<void>;
  onSwitchBranch: (branchName: string) => Promise<void>;
  onCreateBranch: (branchName: string, fromBranch: string) => Promise<void>;
}

export function BranchSelector({
  currentBranch,
  branches,
  isLoading,
  isSwitching,
  isCreating,
  hasUnsavedChanges = false,
  onLoadBranches,
  onSwitchBranch,
  onCreateBranch,
}: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [pendingBranch, setPendingBranch] = useState<string | null>(null);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && branches.length === 0) {
      await onLoadBranches();
    }
  };

  const handleSelectBranch = async (branchName: string) => {
    if (branchName === currentBranch) {
      setIsOpen(false);
      return;
    }

    if (hasUnsavedChanges) {
      setPendingBranch(branchName);
      setShowUnsavedWarning(true);
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
    await onSwitchBranch(branchName);
  };

  const handleConfirmSwitch = async () => {
    if (pendingBranch) {
      await onSwitchBranch(pendingBranch);
      setPendingBranch(null);
    }
    setShowUnsavedWarning(false);
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) return;
    
    await onCreateBranch(newBranchName.trim(), currentBranch);
    setShowCreateDialog(false);
    setNewBranchName('');
  };

  const isValidBranchName = (name: string) => {
    return /^[a-zA-Z0-9/_-]+$/.test(name) && name.length <= 100;
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs font-normal"
            disabled={isSwitching}
          >
            {isSwitching ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <GitBranch className="h-3 w-3" />
            )}
            {currentBranch}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Branches
              </div>
              {branches.map((branch) => (
                <DropdownMenuItem
                  key={branch.name}
                  onClick={() => handleSelectBranch(branch.name)}
                  className={cn(
                    'flex items-center justify-between',
                    branch.name === currentBranch && 'bg-accent'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <GitBranch className="h-3 w-3" />
                    {branch.name}
                    {branch.isDefault && (
                      <span className="text-[10px] px-1 py-0.5 bg-primary/10 text-primary rounded">
                        default
                      </span>
                    )}
                  </span>
                  {branch.name === currentBranch && (
                    <Check className="h-3 w-3" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                setIsOpen(false);
                setShowCreateDialog(true);
              }}>
                <Plus className="h-3 w-3 mr-2" />
                Create new branch
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Branch Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
            <DialogDescription>
              Create a new branch from <strong>{currentBranch}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input
                id="branch-name"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="feature/my-new-feature"
              />
              {newBranchName && !isValidBranchName(newBranchName) && (
                <p className="text-xs text-destructive">
                  Branch name can only contain letters, numbers, hyphens, underscores, and forward slashes
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBranch}
              disabled={!newBranchName.trim() || !isValidBranchName(newBranchName) || isCreating}
            >
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Warning */}
      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Switching branches will discard these changes.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingBranch(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSwitch}>
              Discard & Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
