import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Key, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Trash2, 
  Users,
  Clock,
  Shield,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface TeamSession {
  id: string;
  display_name: string;
  ip_address: string;
  created_at: string;
  expires_at: string;
}

interface TeamConfig {
  id: string;
  is_enabled: boolean;
  session_duration_hours: number;
  updated_at: string;
}

export function TeamAccessSettings() {
  const [config, setConfig] = useState<TeamConfig | null>(null);
  const [sessions, setSessions] = useState<TeamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [newPasscode, setNewPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customPasscode, setCustomPasscode] = useState('');
  const [sessionDuration, setSessionDuration] = useState(24);

  const fetchConfig = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke('manage-team-passcode', {
        body: { action: 'get_config' }
      });

      if (response.data?.success) {
        setConfig(response.data.config);
        setSessions(response.data.activeSessions || []);
        if (response.data.config) {
          setSessionDuration(response.data.config.session_duration_hours);
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Failed to load team access settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleGeneratePasscode = async () => {
    setActionLoading('generate');
    try {
      const response = await supabase.functions.invoke('manage-team-passcode', {
        body: { action: 'set_passcode' }
      });

      if (response.data?.success) {
        setNewPasscode(response.data.passcode);
        setShowPasscode(true);
        toast.success('New passcode generated');
        fetchConfig();
      } else {
        toast.error(response.data?.error || 'Failed to generate passcode');
      }
    } catch (error) {
      console.error('Error generating passcode:', error);
      toast.error('Failed to generate passcode');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetCustomPasscode = async () => {
    if (!/^\d{6}$/.test(customPasscode)) {
      toast.error('Passcode must be exactly 6 digits');
      return;
    }

    setActionLoading('custom');
    try {
      const response = await supabase.functions.invoke('manage-team-passcode', {
        body: { action: 'set_passcode', passcode: customPasscode }
      });

      if (response.data?.success) {
        setNewPasscode(customPasscode);
        setShowPasscode(true);
        setCustomPasscode('');
        toast.success('Passcode set successfully');
        fetchConfig();
      } else {
        toast.error(response.data?.error || 'Failed to set passcode');
      }
    } catch (error) {
      console.error('Error setting passcode:', error);
      toast.error('Failed to set passcode');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    setActionLoading('toggle');
    try {
      const response = await supabase.functions.invoke('manage-team-passcode', {
        body: { action: 'toggle_enabled', isEnabled: enabled }
      });

      if (response.data?.success) {
        toast.success(response.data.message);
        fetchConfig();
      } else {
        toast.error(response.data?.error || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error toggling enabled:', error);
      toast.error('Failed to update setting');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateDuration = async (hours: number) => {
    try {
      const response = await supabase.functions.invoke('manage-team-passcode', {
        body: { action: 'update_duration', sessionDurationHours: hours }
      });

      if (response.data?.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error updating duration:', error);
      toast.error('Failed to update duration');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setActionLoading(`revoke-${sessionId}`);
    try {
      const response = await supabase.functions.invoke('manage-team-passcode', {
        body: { action: 'revoke_session', sessionId }
      });

      if (response.data?.success) {
        toast.success('Session revoked');
        fetchConfig();
      } else {
        toast.error(response.data?.error || 'Failed to revoke session');
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error('Failed to revoke session');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    setActionLoading('revoke-all');
    try {
      const response = await supabase.functions.invoke('manage-team-passcode', {
        body: { action: 'revoke_all_sessions' }
      });

      if (response.data?.success) {
        toast.success(response.data.message);
        fetchConfig();
      } else {
        toast.error(response.data?.error || 'Failed to revoke sessions');
      }
    } catch (error) {
      console.error('Error revoking sessions:', error);
      toast.error('Failed to revoke sessions');
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newPasscode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Passcode Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Team Passcode
          </CardTitle>
          <CardDescription>
            Manage the 6-digit passcode for team member access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {newPasscode && (
            <Alert className="bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-2xl tracking-widest">
                    {showPasscode ? newPasscode : '••••••'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPasscode(!showPasscode)}
                  >
                    {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <AlertDescription className="mt-2 text-xs text-muted-foreground">
                Share this passcode securely with your team members
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleGeneratePasscode}
              disabled={actionLoading === 'generate'}
            >
              {actionLoading === 'generate' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Generate New Passcode
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Set Custom Passcode</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter 6 digits"
                value={customPasscode}
                onChange={(e) => setCustomPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="font-mono tracking-widest"
              />
              <Button
                variant="outline"
                onClick={handleSetCustomPasscode}
                disabled={customPasscode.length !== 6 || actionLoading === 'custom'}
              >
                {actionLoading === 'custom' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Set'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Team Access</Label>
              <p className="text-sm text-muted-foreground">
                Allow team members to sign in with the passcode
              </p>
            </div>
            <Switch
              checked={config?.is_enabled ?? false}
              onCheckedChange={handleToggleEnabled}
              disabled={!config || actionLoading === 'toggle'}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Session Duration</Label>
              <span className="text-sm font-medium">{sessionDuration} hours</span>
            </div>
            <Slider
              value={[sessionDuration]}
              onValueChange={(v) => setSessionDuration(v[0])}
              onValueCommit={(v) => handleUpdateDuration(v[0])}
              min={1}
              max={168}
              step={1}
              className="w-full"
              disabled={!config}
            />
            <p className="text-xs text-muted-foreground">
              Team sessions will expire after this duration (1 hour to 7 days)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                {sessions.length} active team session{sessions.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            {sessions.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRevokeAllSessions}
                disabled={actionLoading === 'revoke-all'}
              >
                {actionLoading === 'revoke-all' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Revoke All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active team sessions
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.display_name}</span>
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        Expires {formatDistanceToNow(new Date(session.expires_at), { addSuffix: true })}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session.ip_address} • Started {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={actionLoading === `revoke-${session.id}`}
                  >
                    {actionLoading === `revoke-${session.id}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}