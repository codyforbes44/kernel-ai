import { useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings2, Keyboard, MessageSquarePlus, GraduationCap } from 'lucide-react';
import { WelcomeTour } from '@/components/onboarding/WelcomeTour';
import { PerformanceCard } from './PerformanceCard';
import { PWASettingsCard } from './PWASettingsCard';

export function AdvancedSettings() {
  const { preferences, updatePreference, loading: preferencesLoading } = useUserPreferences();
  const [showTour, setShowTour] = useState(false);

  return (
    <>
      <PerformanceCard />

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
            <Button variant="outline" onClick={() => setShowTour(true)} className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Start Tour
            </Button>
          </div>
        </CardContent>
      </Card>

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
                    <kbd key={i} className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded">
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <PWASettingsCard />

      {showTour && <WelcomeTour forceShow onComplete={() => setShowTour(false)} />}
    </>
  );
}
