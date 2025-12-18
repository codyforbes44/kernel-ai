import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

interface CleanupConversationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CleanupConversationsDialog({
  open,
  onOpenChange,
}: CleanupConversationsDialogProps) {
  const { user } = useAuth();
  const { refresh } = useWorkspace();
  const [emptyConversations, setEmptyConversations] = useState<{ id: string; title: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchEmptyConversations();
    }
  }, [open, user]);

  const fetchEmptyConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, created_at, message_count")
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .or("message_count.eq.0,message_count.is.null")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmptyConversations(data || []);
    } catch (error) {
      console.error("Error fetching empty conversations:", error);
      toast.error("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (emptyConversations.length === 0) return;

    setDeleting(true);
    try {
      const ids = emptyConversations.map((c) => c.id);
      const { error } = await supabase
        .from("conversations")
        .delete()
        .in("id", ids);

      if (error) throw error;

      toast.success(`Deleted ${emptyConversations.length} empty conversation(s)`);
      await refresh();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting conversations:", error);
      toast.error("Failed to delete conversations");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Clean Up Empty Conversations
          </DialogTitle>
          <DialogDescription>
            Remove conversations that have no messages. This helps keep your workspace tidy.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : emptyConversations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No empty conversations found.</p>
              <p className="text-sm mt-1">Your workspace is already clean!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-sm">
                  Found <strong>{emptyConversations.length}</strong> empty conversation(s) to delete.
                </p>
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border p-2">
                {emptyConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 text-sm"
                  >
                    <span className="truncate">{conv.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {new Date(conv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAll}
            disabled={loading || deleting || emptyConversations.length === 0}
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All ({emptyConversations.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
