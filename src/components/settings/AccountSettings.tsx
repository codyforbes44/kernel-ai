import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { toast } from 'sonner';
import { User, Save, Loader2, Download, History, Trash2 } from 'lucide-react';
import { useVariableHistory } from '@/hooks/useVariableHistory';

export function AccountSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearHistory } = useVariableHistory();
  const [displayName, setDisplayName] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearHistoryDialogOpen, setClearHistoryDialogOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle();
        const name = data?.display_name || '';
        setDisplayName(name);
        setOriginalDisplayName(name);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, [user]);

  const hasDisplayNameChanged = displayName !== originalDisplayName;

  const handleSaveDisplayName = async () => {
    if (!user || !hasDisplayNameChanged) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() || null })
        .eq('id', user.id);
      if (error) throw error;
      setOriginalDisplayName(displayName.trim());
      toast.success('Display name updated');
    } catch (error) {
      console.error('Failed to save display name:', error);
      toast.error('Failed to update display name');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleExportAllData = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const [conversations, messages, templates] = await Promise.all([
        supabase.from('conversations').select('*').eq('user_id', user.id),
        supabase.from('messages').select('*').eq('user_id', user.id),
        supabase.from('prompt_templates').select('*').eq('user_id', user.id),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        user: { id: user.id, email: user.email },
        conversations: conversations.data || [],
        messages: messages.data || [],
        templates: templates.data || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kernel-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be signed in to delete your account');
        return;
      }

      const { error } = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) {
        toast.error('Failed to delete account. Please try again.');
        return;
      }

      toast.success('Account deleted successfully');
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (err) {
      console.error('Delete account error:', err);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="flex gap-2">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={isLoadingProfile ? 'Loading...' : 'Enter your display name'}
                disabled={isLoadingProfile}
              />
              <Button
                onClick={handleSaveDisplayName}
                disabled={!hasDisplayNameChanged || isSavingProfile}
                className="gap-2 shrink-0"
              >
                {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data & Privacy
          </CardTitle>
          <CardDescription>Manage your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Export All Data</Label>
              <p className="text-sm text-muted-foreground">Download all your conversations and templates</p>
            </div>
            <Button variant="outline" onClick={handleExportAllData} disabled={isExporting} className="gap-2">
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Clear Variable History</Label>
              <p className="text-sm text-muted-foreground">Remove all saved template variable suggestions</p>
            </div>
            <Button variant="outline" onClick={() => setClearHistoryDialogOpen(true)} className="gap-2">
              <History className="h-4 w-4" />
              Clear
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-destructive">Delete Account</Label>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={clearHistoryDialogOpen}
        onOpenChange={setClearHistoryDialogOpen}
        title="Clear Variable History"
        description="This will remove all saved template variable suggestions."
        onConfirm={() => {
          clearHistory();
          toast.success('Variable history cleared');
        }}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Account"
        description="This will permanently delete your account and all associated data. This action cannot be undone."
        onConfirm={handleDeleteAccount}
      />
    </>
  );
}
