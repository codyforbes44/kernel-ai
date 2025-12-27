import { useUserPreferences, AI_MODEL_OPTIONS } from '@/hooks/useUserPreferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Bot, Sparkles, Bell, Volume2, Monitor, Type, Clock, Code, FileText } from 'lucide-react';
import { VoiceAgentSettingsCard } from './VoiceAgentSettingsCard';

export function AISettings() {
  const { preferences, updatePreference, loading: preferencesLoading } = useUserPreferences();

  return (
    <>
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
              <p className="text-sm text-muted-foreground">Choose the AI model for new conversations</p>
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
              <p className="text-sm text-muted-foreground">Show AI responses as they're generated</p>
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
              <p className="text-sm text-muted-foreground">Play sounds for message events</p>
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
              <p className="text-sm text-muted-foreground">Show browser notifications for new messages</p>
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
              <p className="text-sm text-muted-foreground">Display time next to each message</p>
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
              <p className="text-sm text-muted-foreground">Choose syntax highlighting theme</p>
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
              <p className="text-sm text-muted-foreground">Render markdown formatting in messages</p>
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

      <VoiceAgentSettingsCard />
    </>
  );
}
