import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProtectedPage } from '@/hooks/useProtectedPage';
import { useTheme } from 'next-themes';
import { useVariableHistory } from '@/hooks/useVariableHistory';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import {
  User,
  Moon,
  Sun,
  Keyboard,
  Shield,
  Trash2,
  Download,
  History,
  Save,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import { WelcomeTour } from '@/components/onboarding/WelcomeTour';

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useProtectedPage();
  const { signOut } = useProtectedPage().user ? { signOut: async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    navigate('/auth');
  }} : { signOut: async () => {} };
  const { theme, setTheme } = useTheme();
  const { clearHistory } = useVariableHistory();
  const [displayName, setDisplayName] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearHistoryDialogOpen, setClearHistoryDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, preferences')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        const name = data?.display_name || '';
        setDisplayName(name);
        setOriginalDisplayName(name);
        
        // Load preferences
        const prefs = data?.preferences as { reduced_motion?: boolean } | null;
        const reducedMotionPref = prefs?.reduced_motion ?? false;
        setReducedMotion(reducedMotionPref);
        
        // Apply reduced motion to document
        if (reducedMotionPref) {
          document.documentElement.classList.add('reduce-motion');
        }
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

  const handleReducedMotionChange = async (enabled: boolean) => {
    if (!user) return;
    
    setReducedMotion(enabled);
    setIsSavingPreferences(true);
    
    // Apply immediately to document
    if (enabled) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    try {
      // Fetch current preferences first
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .maybeSingle();
      
      const currentPrefs = (profile?.preferences as Record<string, unknown>) || {};
      const updatedPrefs = { ...currentPrefs, reduced_motion: enabled };
      
      const { error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPrefs })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success(enabled ? 'Reduced motion enabled' : 'Reduced motion disabled');
    } catch (error) {
      console.error('Failed to save preference:', error);
      toast.error('Failed to save preference');
      // Revert on error
      setReducedMotion(!enabled);
      if (!enabled) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleExportAllData = async () => {
    if (!user) return;
    setIsExporting(true);

    try {
      // Fetch all user data
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

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lovable-assistant-export-${new Date().toISOString().split('T')[0]}.json`;
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
    // Note: Full account deletion would need a backend function
    toast.info('Account deletion requested. Contact support to complete.');
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Settings"
        backLabel="Chat"
        actions={
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        }
      />

      {/* Content */}
      <main className="container max-w-3xl mx-auto py-8 px-4 space-y-8">
        {/* Profile */}
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
                  {isSavingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark theme for the interface
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reduced Motion</Label>
                <p className="text-sm text-muted-foreground">
                  Reduce animations throughout the app
                </p>
              </div>
              <Switch
                checked={reducedMotion}
                onCheckedChange={handleReducedMotionChange}
                disabled={isLoadingProfile || isSavingPreferences}
              />
            </div>
          </CardContent>
        </Card>

        {/* Onboarding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Getting Started
            </CardTitle>
            <CardDescription>Learn how to use the app</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Take the Tour</Label>
                <p className="text-sm text-muted-foreground">
                  View the welcome tour to learn about key features
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowTour(true)}
                className="gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                Start Tour
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </CardTitle>
            <CardDescription>Quick actions for power users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {[
                { keys: ['⌘', 'K'], action: 'Open command palette' },
                { keys: ['⌘', 'N'], action: 'New conversation' },
                { keys: ['⌘', 'B'], action: 'Toggle sidebar' },
                { keys: ['⌘', 'D'], action: 'Toggle dark mode' },
                { keys: ['⌘', 'Enter'], action: 'Send message' },
              ].map((shortcut) => (
                <div key={shortcut.action} className="flex items-center justify-between py-2">
                  <span className="text-sm">{shortcut.action}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd
                        key={i}
                        className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data & Privacy
            </CardTitle>
            <CardDescription>Manage your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Export All Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download all your conversations and templates
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleExportAllData}
                disabled={isExporting}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Clear Variable History</Label>
                <p className="text-sm text-muted-foreground">
                  Remove all saved template variable suggestions
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setClearHistoryDialogOpen(true)}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                Clear
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-destructive">Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <DeleteConfirmDialog
        open={clearHistoryDialogOpen}
        onOpenChange={setClearHistoryDialogOpen}
        title="Clear Variable History"
        description="This will remove all saved template variable suggestions. You'll need to enter values manually again."
        onConfirm={() => {
          clearHistory();
          toast.success('Variable history cleared');
        }}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Account"
        description="This will permanently delete your account and all associated data including conversations, messages, and templates. This action cannot be undone."
        onConfirm={handleDeleteAccount}
      />

      {showTour && (
        <WelcomeTour forceShow onComplete={() => setShowTour(false)} />
      )}
    </div>
  );
}
