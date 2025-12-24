import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useXAISettings } from '@/hooks/useXAISettings';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RefreshButton } from './RefreshButton';
import { EmptyState } from './EmptyState';
import { 
  Settings, 
  Zap, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  Save,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function XAISettingsPanel() {
  const {
    settings,
    isLoadingSettings,
    usageSummary,
    usageData,
    isLoadingUsage,
    refetchSettings,
    refetchUsage,
    updateSettings,
    isUpdating,
    toggleEnabled,
  } = useXAISettings();

  const [localRateLimit, setLocalRateLimit] = useState<number>(100);
  const [localAlertThreshold, setLocalAlertThreshold] = useState<number>(500);
  const [localMaxTokens, setLocalMaxTokens] = useState<number>(4000);
  const [localDefaultModel, setLocalDefaultModel] = useState<string>('grok-3-fast');

  // Sync local state with settings when loaded
  useEffect(() => {
    if (settings) {
      setLocalRateLimit(settings.rate_limit_per_user_daily);
      setLocalAlertThreshold(settings.alert_threshold_daily);
      setLocalMaxTokens(settings.max_tokens_per_request);
      setLocalDefaultModel(settings.default_model);
    }
  }, [settings]);

  const handleSaveSettings = () => {
    updateSettings({
      rate_limit_per_user_daily: localRateLimit,
      alert_threshold_daily: localAlertThreshold,
      max_tokens_per_request: localMaxTokens,
      default_model: localDefaultModel,
    });
  };

  const handleRefresh = () => {
    refetchSettings();
    refetchUsage();
  };

  const hasChanges = settings && (
    localRateLimit !== settings.rate_limit_per_user_daily ||
    localAlertThreshold !== settings.alert_threshold_daily ||
    localMaxTokens !== settings.max_tokens_per_request ||
    localDefaultModel !== settings.default_model
  );

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!settings) {
    return (
      <EmptyState
        icon={Settings}
        title="Settings Not Found"
        description="xAI settings have not been configured yet."
      />
    );
  }

  // Prepare chart data
  const usageChartData = usageSummary.usageByDate
    .slice(0, 14)
    .reverse()
    .map(d => ({
      date: format(new Date(d.date), 'MMM d'),
      requests: d.requests,
      tokens: Math.round(d.tokens / 1000), // Show in thousands
    }));

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">xAI / Grok Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure xAI integration, rate limits, and monitor usage
          </p>
        </div>
        <RefreshButton onRefresh={handleRefresh} />
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.is_enabled ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span className="font-medium">Status</span>
              </div>
              <Badge variant={settings.is_enabled ? 'default' : 'destructive'}>
                {settings.is_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-medium">Total Requests</span>
              </div>
              <span className="text-2xl font-bold">{usageSummary.totalRequests.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-medium">Total Tokens</span>
              </div>
              <span className="text-2xl font-bold">{usageSummary.totalTokens.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">Active Users</span>
              </div>
              <span className="text-2xl font-bold">{usageSummary.topUsers.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
          <CardDescription>
            Manage xAI feature settings and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="xai-enabled">Enable xAI Features</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to access X automation with Grok AI
              </p>
            </div>
            <Switch
              id="xai-enabled"
              checked={settings.is_enabled}
              onCheckedChange={toggleEnabled}
              disabled={isUpdating}
            />
          </div>

          <Separator />

          {/* Default Model */}
          <div className="grid gap-2">
            <Label htmlFor="default-model">Default Model</Label>
            <Select
              value={localDefaultModel}
              onValueChange={setLocalDefaultModel}
              disabled={!settings.is_enabled}
            >
              <SelectTrigger id="default-model" className="w-full md:w-[250px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grok-3">Grok-3 (Most Capable)</SelectItem>
                <SelectItem value="grok-3-fast">Grok-3 Fast (Balanced)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Default model for tweet generation and analysis
            </p>
          </div>

          <Separator />

          {/* Rate Limit */}
          <div className="grid gap-2">
            <Label htmlFor="rate-limit">Daily Rate Limit (per user)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="rate-limit"
                type="number"
                min={1}
                max={1000}
                value={localRateLimit}
                onChange={(e) => setLocalRateLimit(parseInt(e.target.value) || 1)}
                className="w-32"
                disabled={!settings.is_enabled}
              />
              <span className="text-sm text-muted-foreground">requests per day</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Maximum number of xAI requests each user can make per day
            </p>
          </div>

          {/* Alert Threshold */}
          <div className="grid gap-2">
            <Label htmlFor="alert-threshold">Alert Threshold (daily total)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="alert-threshold"
                type="number"
                min={1}
                max={10000}
                value={localAlertThreshold}
                onChange={(e) => setLocalAlertThreshold(parseInt(e.target.value) || 1)}
                className="w-32"
                disabled={!settings.is_enabled}
              />
              <span className="text-sm text-muted-foreground">requests system-wide</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Get alerted when total daily usage exceeds this threshold
            </p>
            {usageSummary.totalRequests > localAlertThreshold && (
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Current usage exceeds alert threshold!</span>
              </div>
            )}
          </div>

          {/* Max Tokens */}
          <div className="grid gap-2">
            <Label htmlFor="max-tokens">Max Tokens Per Request</Label>
            <div className="flex items-center gap-4">
              <Input
                id="max-tokens"
                type="number"
                min={100}
                max={32000}
                value={localMaxTokens}
                onChange={(e) => setLocalMaxTokens(parseInt(e.target.value) || 100)}
                className="w-32"
                disabled={!settings.is_enabled}
              />
              <span className="text-sm text-muted-foreground">tokens</span>
            </div>
          </div>

          <Separator />

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Last updated: {format(new Date(settings.updated_at), 'MMM d, yyyy HH:mm')}
            </p>
            <Button
              onClick={handleSaveSettings}
              disabled={!hasChanges || isUpdating}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Over Time
          </CardTitle>
          <CardDescription>
            xAI request activity over the last 14 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsage ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : usageChartData.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No Usage Data"
              description="No xAI usage has been recorded yet."
            />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="requests" fill="hsl(var(--primary))" name="Requests" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Users by Usage
          </CardTitle>
          <CardDescription>
            Users with the highest xAI request counts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usageSummary.topUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Users"
              description="No user usage data available yet."
            />
          ) : (
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageSummary.topUsers.map((user, index) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 justify-center">
                            {index + 1}
                          </Badge>
                          {user.user_id.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {user.request_count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {user.tokens_used.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
