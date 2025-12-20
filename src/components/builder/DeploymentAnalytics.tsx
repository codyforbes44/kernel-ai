import { useMemo } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Package
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Deployment } from '@/hooks/useDeployments';

interface DeploymentAnalyticsProps {
  deployments: Deployment[];
}

export function DeploymentAnalytics({ deployments }: DeploymentAnalyticsProps) {
  const analytics = useMemo(() => {
    const completedDeployments = deployments.filter(
      d => d.status === 'deployed' || d.status === 'failed'
    );

    const successful = completedDeployments.filter(d => d.status === 'deployed');
    const failed = completedDeployments.filter(d => d.status === 'failed');

    // Success rate
    const successRate = completedDeployments.length > 0 
      ? (successful.length / completedDeployments.length) * 100 
      : 0;

    // Average build time (only successful builds with duration)
    const buildTimes = successful
      .filter(d => d.buildDurationMs)
      .map(d => d.buildDurationMs!);
    const avgBuildTime = buildTimes.length > 0 
      ? buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length 
      : 0;

    // Build time trend (compare last 5 vs previous 5)
    const recentBuildTimes = buildTimes.slice(0, 5);
    const olderBuildTimes = buildTimes.slice(5, 10);
    const recentAvg = recentBuildTimes.length > 0 
      ? recentBuildTimes.reduce((a, b) => a + b, 0) / recentBuildTimes.length 
      : 0;
    const olderAvg = olderBuildTimes.length > 0 
      ? olderBuildTimes.reduce((a, b) => a + b, 0) / olderBuildTimes.length 
      : 0;
    const buildTimeTrend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    // Bundle size trend
    const bundleSizes = successful
      .filter(d => d.bundleSizeBytes)
      .map(d => ({ version: d.version, size: d.bundleSizeBytes!, date: d.createdAt }));
    
    const latestBundleSize = bundleSizes[0]?.size || 0;
    const previousBundleSize = bundleSizes[1]?.size || 0;
    const bundleSizeTrend = previousBundleSize > 0 
      ? ((latestBundleSize - previousBundleSize) / previousBundleSize) * 100 
      : 0;

    // Build time over time (last 10 deployments, reversed for chronological order)
    const buildTimeData = successful
      .filter(d => d.buildDurationMs)
      .slice(0, 10)
      .reverse()
      .map(d => ({
        version: `v${d.version}`,
        time: Math.round(d.buildDurationMs! / 1000),
        env: d.environment,
      }));

    // Bundle size over time (last 10)
    const bundleSizeData = bundleSizes
      .slice(0, 10)
      .reverse()
      .map(d => ({
        version: `v${d.version}`,
        size: Math.round(d.size / 1024), // KB
      }));

    // Success/failure pie chart data
    const statusData = [
      { name: 'Successful', value: successful.length, color: 'hsl(var(--success))' },
      { name: 'Failed', value: failed.length, color: 'hsl(var(--destructive))' },
    ].filter(d => d.value > 0);

    // Deployments by environment
    const previewCount = completedDeployments.filter(d => d.environment === 'preview').length;
    const productionCount = completedDeployments.filter(d => d.environment === 'production').length;

    return {
      totalDeployments: completedDeployments.length,
      successful: successful.length,
      failed: failed.length,
      successRate,
      avgBuildTime,
      buildTimeTrend,
      latestBundleSize,
      bundleSizeTrend,
      buildTimeData,
      bundleSizeData,
      statusData,
      previewCount,
      productionCount,
    };
  }, [deployments]);

  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const TrendIndicator = ({ value, inverted = false }: { value: number; inverted?: boolean }) => {
    const isPositive = inverted ? value < 0 : value > 0;
    const isNegative = inverted ? value > 0 : value < 0;
    
    if (Math.abs(value) < 1) {
      return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
    
    return (
      <span className={`flex items-center gap-0.5 text-[10px] ${
        isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground'
      }`}>
        {value > 0 ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  if (deployments.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No deployment data available yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase">Success Rate</span>
            <CheckCircle className="h-3 w-3 text-success" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">{analytics.successRate.toFixed(0)}%</span>
            <span className="text-[10px] text-muted-foreground">
              {analytics.successful}/{analytics.totalDeployments}
            </span>
          </div>
        </Card>

        <Card className="p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase">Avg Build Time</span>
            <Clock className="h-3 w-3 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">{formatDuration(analytics.avgBuildTime)}</span>
            <TrendIndicator value={analytics.buildTimeTrend} inverted />
          </div>
        </Card>

        <Card className="p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase">Bundle Size</span>
            <Package className="h-3 w-3 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">{formatBytes(analytics.latestBundleSize)}</span>
            <TrendIndicator value={analytics.bundleSizeTrend} inverted />
          </div>
        </Card>

        <Card className="p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase">Failed</span>
            <XCircle className="h-3 w-3 text-destructive" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">{analytics.failed}</span>
            <span className="text-[10px] text-muted-foreground">deployments</span>
          </div>
        </Card>
      </div>

      {/* Environment Distribution */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px]">
          Preview: {analytics.previewCount}
        </Badge>
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
          Production: {analytics.productionCount}
        </Badge>
      </div>

      {/* Build Time Chart */}
      {analytics.buildTimeData.length > 1 && (
        <Card className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Build Time Trend</span>
          </div>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.buildTimeData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="version" 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                  tickFormatter={(v) => `${v}s`}
                  width={35}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                  formatter={(value: number) => [`${value}s`, 'Build Time']}
                />
                <Bar 
                  dataKey="time" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Bundle Size Chart */}
      {analytics.bundleSizeData.length > 1 && (
        <Card className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Bundle Size Trend</span>
          </div>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.bundleSizeData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="version" 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  className="text-muted-foreground"
                  tickFormatter={(v) => `${v}KB`}
                  width={45}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                  formatter={(value: number) => [`${value} KB`, 'Bundle Size']}
                />
                <Line 
                  type="monotone" 
                  dataKey="size" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 0, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Success/Failure Pie Chart */}
      {analytics.statusData.length > 0 && analytics.totalDeployments > 0 && (
        <Card className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Deployment Status</span>
          </div>
          <div className="h-[100px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success" />
              Successful ({analytics.successful})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              Failed ({analytics.failed})
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
