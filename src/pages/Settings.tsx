import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { useVariableHistory } from '@/hooks/useVariableHistory';
import { useUserPreferences, AI_MODEL_OPTIONS } from '@/hooks/useUserPreferences';
import { useSubscription } from '@/hooks/useSubscription';
import { useLiteMode } from '@/hooks/useLiteMode';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/seo/SEO';
import { AppLayout } from '@/components/layout/AppLayout';
import { PAGE_SEO } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
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
  Settings2,
  MessageSquarePlus,
  Bot,
  Bell,
  Type,
  Clock,
  Code,
  FileText,
  Volume2,
  Monitor,
  Sparkles,
  Smartphone,
  CreditCard,
  Crown,
  ExternalLink,
  Zap,
  Battery,
  Wifi,
} from 'lucide-react';
import { WelcomeTour } from '@/components/onboarding/WelcomeTour';
import { TwoFactorSettings } from '@/components/settings/TwoFactorSettings';
import { LoginLocationsSettings } from '@/components/settings/LoginLocationsSettings';
import { CreditsSettings } from '@/components/settings/CreditsSettings';
import { SystemInfoCard } from '@/components/settings/SystemInfoCard';
import { ExternalSupabaseSettings } from '@/components/settings/ExternalSupabaseSettings';
import { PerformanceCard } from '@/components/settings/PerformanceCard';

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Auth is handled by ProtectedRoute wrapper
  const { user, loading: authLoading } = useAuth();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };
  const { theme, setTheme } = useTheme();
  const { clearHistory } = useVariableHistory();
  const { preferences, updatePreference, loading: preferencesLoading } = useUserPreferences();
  const { 
    subscribed, 
    plan, 
    subscriptionEnd, 
    isLoading: subscriptionLoading, 
    openCustomerPortal,
    checkSubscription 
  } = useSubscription();
  const [displayName, setDisplayName] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearHistoryDialogOpen, setClearHistoryDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  // Handle checkout success state
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Welcome to Pro! Your subscription is now active.');
      checkSubscription();
    }
    // Handle credit purchase success
    const creditsPurchased = searchParams.get('credits_purchased');
    if (creditsPurchased) {
      toast.success(`Successfully purchased ${parseInt(creditsPurchased).toLocaleString()} credits!`);
      // Clear the URL param
      window.history.replaceState({}, '', '/settings');
    }
    // Handle credit purchase cancellation
    if (searchParams.get('credits_cancelled') === 'true') {
      toast.info('Credit purchase was cancelled.');
      window.history.replaceState({}, '', '/settings');
    }
  }, [searchParams, checkSubscription]);

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
        const prefs = data?.preferences as { reduced_motion?: boolean; high_contrast?: boolean } | null;
        const reducedMotionPref = prefs?.reduced_motion ?? false;
        const highContrastPref = prefs?.high_contrast ?? false;
        setReducedMotion(reducedMotionPref);
        setHighContrast(highContrastPref);
        
        // Apply reduced motion to document
        if (reducedMotionPref) {
          document.documentElement.classList.add('reduce-motion');
        }
        // Apply high contrast to document
        if (highContrastPref) {
          document.documentElement.classList.add('high-contrast');
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

  const handleHighContrastChange = async (enabled: boolean) => {
    if (!user) return;
    
    setHighContrast(enabled);
    setIsSavingPreferences(true);
    
    // Apply immediately to document
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    try {
      // Fetch current preferences first
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .maybeSingle();
      
      const currentPrefs = (profile?.preferences as Record<string, unknown>) || {};
      const updatedPrefs = { ...currentPrefs, high_contrast: enabled };
      
      const { error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPrefs })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success(enabled ? 'High contrast enabled' : 'High contrast disabled');
    } catch (error) {
      console.error('Failed to save preference:', error);
      toast.error('Failed to save preference');
      // Revert on error
      setHighContrast(!enabled);
      if (!enabled) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
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

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be signed in to delete your account');
        return;
      }

      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Delete account error:', error);
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

  if (authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <AppLayout>
      <SEO
        title={PAGE_SEO.settings.title}
        description={PAGE_SEO.settings.description}
        noIndex={PAGE_SEO.settings.noIndex}
      />
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

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>Manage your plan and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionLoading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading subscription...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${subscribed ? 'bg-primary/10' : 'bg-muted'}`}>
                      {subscribed ? (
                        <Crown className="h-5 w-5 text-primary" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{plan} Plan</span>
                        {subscribed && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      {subscriptionEnd && (
                        <p className="text-sm text-muted-foreground">
                          Renews on {new Date(subscriptionEnd).toLocaleDateString()}
                        </p>
                      )}
                      {!subscribed && (
                        <p className="text-sm text-muted-foreground">
                          Upgrade to unlock unlimited features
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  {subscribed ? (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={async () => {
                        setIsOpeningPortal(true);
                        try {
                          await openCustomerPortal();
                        } finally {
                          setIsOpeningPortal(false);
                        }
                      }}
                      disabled={isOpeningPortal}
                    >
                      {isOpeningPortal ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                      Manage Subscription
                    </Button>
                  ) : (
                    <Button
                      className="gap-2 bg-gold hover:bg-gold/90 text-gold-foreground shadow-[0_0_15px_hsl(var(--gold)/0.3)]"
                      onClick={() => navigate('/pricing')}
                    >
                      <Crown className="h-4 w-4" />
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* AI Credits */}
        <CreditsSettings />

        {/* Two-Factor Authentication */}
        <TwoFactorSettings />

        {/* Login Locations */}
        <LoginLocationsSettings userId={user.id} />

        {/* External Supabase Connections */}
        <ExternalSupabaseSettings />

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
            <div className="space-y-3">
              <Label>Theme</Label>
              <RadioGroup
                value={theme}
                onValueChange={setTheme}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                <Label
                  htmlFor="theme-light"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                >
                  <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                  <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center">
                    <Sun className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium">Light</span>
                </Label>
                <Label
                  htmlFor="theme-dark"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                >
                  <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                  <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                    <Moon className="h-5 w-5 text-slate-300" />
                  </div>
                  <span className="text-sm font-medium">Dark</span>
                </Label>
                <Label
                  htmlFor="theme-oled"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                >
                  <RadioGroupItem value="oled" id="theme-oled" className="sr-only" />
                  <div className="w-10 h-10 rounded-full bg-black border-2 border-primary/50 flex items-center justify-center ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">OLED</span>
                </Label>
                <Label
                  htmlFor="theme-system"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                >
                  <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-slate-800 border-2 border-muted flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-sm font-medium">System</span>
                </Label>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                {theme === 'system' 
                  ? 'Theme will automatically match your system preferences' 
                  : theme === 'oled'
                  ? 'Pure black for OLED displays - saves battery'
                  : `Using ${theme} theme`}
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
                  </svg>
                  High Contrast
                </Label>
                <p className="text-sm text-muted-foreground">
                  Increase text contrast and reduce visual complexity
                </p>
              </div>
              <Switch
                checked={highContrast}
                onCheckedChange={handleHighContrastChange}
                disabled={isLoadingProfile || isSavingPreferences}
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

        {/* Performance / Lite Mode */}
        <PerformanceCard />

        {/* Workflow Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Workflow
            </CardTitle>
            <CardDescription>Customize your workflow settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <MessageSquarePlus className="h-4 w-4 text-primary" />
                  Auto-create chat on new project
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start a chat session when creating a new project
                </p>
              </div>
              <Switch
                checked={preferences.autoCreateChatOnProject ?? true}
                onCheckedChange={(checked) => {
                  updatePreference('autoCreateChatOnProject', checked);
                  toast.success(checked ? 'Auto-chat enabled' : 'Auto-chat disabled');
                }}
                disabled={preferencesLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Settings
            </CardTitle>
            <CardDescription>Configure AI behavior and model selection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Default AI Model
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose the AI model for new conversations
                </p>
              </div>
              <Select
                value={preferences.defaultAIModel ?? 'google/gemini-2.5-flash'}
                onValueChange={(value) => {
                  updatePreference('defaultAIModel', value as any);
                  toast.success('Default model updated');
                }}
                disabled={preferencesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODEL_OPTIONS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex flex-col">
                        <span>{model.label}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Stream Responses</Label>
                <p className="text-sm text-muted-foreground">
                  Show AI responses as they're generated
                </p>
              </div>
              <Switch
                checked={preferences.streamResponses ?? true}
                onCheckedChange={(checked) => {
                  updatePreference('streamResponses', checked);
                  toast.success(checked ? 'Streaming enabled' : 'Streaming disabled');
                }}
                disabled={preferencesLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-primary" />
                  Sound Effects
                </Label>
                <p className="text-sm text-muted-foreground">
                  Play sounds for message events
                </p>
              </div>
              <Switch
                checked={preferences.soundEnabled ?? false}
                onCheckedChange={(checked) => {
                  updatePreference('soundEnabled', checked);
                  toast.success(checked ? 'Sound enabled' : 'Sound disabled');
                }}
                disabled={preferencesLoading}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" />
                  Desktop Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show browser notifications for new messages
                </p>
              </div>
              <Switch
                checked={preferences.desktopNotifications ?? false}
                onCheckedChange={async (checked) => {
                  if (checked && 'Notification' in window) {
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') {
                      toast.error('Notification permission denied');
                      return;
                    }
                  }
                  updatePreference('desktopNotifications', checked);
                  toast.success(checked ? 'Notifications enabled' : 'Notifications disabled');
                }}
                disabled={preferencesLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Message Formatting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Message Formatting
            </CardTitle>
            <CardDescription>Customize how messages are displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Message Density</Label>
              <RadioGroup
                value={preferences.messageDensity ?? 'comfortable'}
                onValueChange={(value) => {
                  updatePreference('messageDensity', value as any);
                  toast.success('Message density updated');
                }}
                className="flex gap-4"
                disabled={preferencesLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="compact" />
                  <Label htmlFor="compact" className="cursor-pointer">Compact</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfortable" id="comfortable" />
                  <Label htmlFor="comfortable" className="cursor-pointer">Comfortable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spacious" id="spacious" />
                  <Label htmlFor="spacious" className="cursor-pointer">Spacious</Label>
                </div>
              </RadioGroup>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Show Timestamps
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display time next to each message
                </p>
              </div>
              <Switch
                checked={preferences.showTimestamps ?? true}
                onCheckedChange={(checked) => {
                  updatePreference('showTimestamps', checked);
                  toast.success(checked ? 'Timestamps shown' : 'Timestamps hidden');
                }}
                disabled={preferencesLoading}
              />
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" />
                  Code Block Theme
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose syntax highlighting theme for code
                </p>
              </div>
              <RadioGroup
                value={preferences.codeBlockTheme ?? 'auto'}
                onValueChange={(value) => {
                  updatePreference('codeBlockTheme', value as any);
                  toast.success('Code theme updated');
                }}
                className="flex gap-4"
                disabled={preferencesLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="auto" id="code-auto" />
                  <Label htmlFor="code-auto" className="cursor-pointer">Auto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="code-dark" />
                  <Label htmlFor="code-dark" className="cursor-pointer">Dark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="code-light" />
                  <Label htmlFor="code-light" className="cursor-pointer">Light</Label>
                </div>
              </RadioGroup>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Markdown Preview
                </Label>
                <p className="text-sm text-muted-foreground">
                  Render markdown formatting in messages
                </p>
              </div>
              <Switch
                checked={preferences.enableMarkdownPreview ?? true}
                onCheckedChange={(checked) => {
                  updatePreference('enableMarkdownPreview', checked);
                  toast.success(checked ? 'Markdown preview enabled' : 'Markdown preview disabled');
                }}
                disabled={preferencesLoading}
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

        {/* System Information */}
        <SystemInfoCard />
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
        description="This will permanently delete your account and all associated data including conversations, messages, projects, and templates. This action cannot be undone."
        onConfirm={handleDeleteAccount}
      />

      {showTour && (
        <WelcomeTour forceShow onComplete={() => setShowTour(false)} />
      )}
    </AppLayout>
  );
}
