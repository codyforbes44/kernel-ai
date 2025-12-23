import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, Clock, Gauge, MousePointer, Paintbrush, Layers, Info, RefreshCw } from 'lucide-react';
import { subscribeToVitals, getPerformanceScore, type WebVitalsData, type VitalMetric } from '@/lib/webVitals';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VitalCardProps {
  metric: VitalMetric | null;
  icon: React.ReactNode;
  description: string;
  unit: string;
  formatter?: (value: number) => string;
}

function VitalCard({ metric, icon, description, unit, formatter }: VitalCardProps) {
  const formatValue = formatter || ((v: number) => v.toFixed(2));
  
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-sm font-medium">{metric?.name || '—'}</CardTitle>
          </div>
          {metric && (
            <Badge
              variant={metric.rating === 'good' ? 'default' : metric.rating === 'needs-improvement' ? 'secondary' : 'destructive'}
              className={cn(
                "text-xs",
                metric.rating === 'good' && "bg-success text-success-foreground",
                metric.rating === 'needs-improvement' && "bg-warning text-warning-foreground"
              )}
            >
              {metric.rating}
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums">
            {metric ? formatValue(metric.value) : '—'}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        {metric && (
          <Progress 
            value={metric.rating === 'good' ? 100 : metric.rating === 'needs-improvement' ? 50 : 20} 
            className={cn(
              "h-1 mt-2",
              metric.rating === 'good' && "[&>div]:bg-success",
              metric.rating === 'needs-improvement' && "[&>div]:bg-warning",
              metric.rating === 'poor' && "[&>div]:bg-destructive"
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}

export function WebVitalsDashboard() {
  const [vitals, setVitals] = useState<WebVitalsData>({
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null,
    INP: null,
  });
  const [score, setScore] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToVitals((newVitals) => {
      setVitals(newVitals);
      setScore(getPerformanceScore());
      setLastUpdated(new Date());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const vitalConfigs = [
    {
      key: 'LCP',
      metric: vitals.LCP,
      icon: <Paintbrush className="h-4 w-4 text-primary" />,
      description: 'Largest Contentful Paint - loading performance',
      unit: 'ms',
      formatter: (v: number) => v.toFixed(0),
    },
    {
      key: 'FID',
      metric: vitals.FID,
      icon: <MousePointer className="h-4 w-4 text-primary" />,
      description: 'First Input Delay - interactivity',
      unit: 'ms',
      formatter: (v: number) => v.toFixed(0),
    },
    {
      key: 'CLS',
      metric: vitals.CLS,
      icon: <Layers className="h-4 w-4 text-primary" />,
      description: 'Cumulative Layout Shift - visual stability',
      unit: '',
      formatter: (v: number) => v.toFixed(3),
    },
    {
      key: 'INP',
      metric: vitals.INP,
      icon: <Activity className="h-4 w-4 text-primary" />,
      description: 'Interaction to Next Paint - responsiveness',
      unit: 'ms',
      formatter: (v: number) => v.toFixed(0),
    },
    {
      key: 'FCP',
      metric: vitals.FCP,
      icon: <Clock className="h-4 w-4 text-primary" />,
      description: 'First Contentful Paint - perceived load speed',
      unit: 'ms',
      formatter: (v: number) => v.toFixed(0),
    },
    {
      key: 'TTFB',
      metric: vitals.TTFB,
      icon: <Gauge className="h-4 w-4 text-primary" />,
      description: 'Time to First Byte - server response time',
      unit: 'ms',
      formatter: (v: number) => v.toFixed(0),
    },
  ];

  const metricsCollected = Object.values(vitals).filter(Boolean).length;
  const scoreColor = score >= 90 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Web Vitals
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time performance monitoring based on Google's Core Web Vitals
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reload page to capture new metrics</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-card to-secondary/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Performance Score</p>
              <p className={cn("text-5xl font-bold tabular-nums", scoreColor)}>
                {score}
              </p>
              <p className="text-xs text-muted-foreground">
                {metricsCollected}/6 metrics collected
              </p>
            </div>
            <div className="text-right space-y-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-muted-foreground cursor-help">
                    <Info className="h-4 w-4" />
                    <span className="text-xs">How is this calculated?</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Score is weighted average of all metrics: LCP (25%), CLS (25%), FID (15%), FCP (15%), INP (10%), TTFB (10%)</p>
                </TooltipContent>
              </Tooltip>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <Progress 
            value={score} 
            className={cn(
              "h-2 mt-4",
              score >= 90 && "[&>div]:bg-success",
              score >= 50 && score < 90 && "[&>div]:bg-warning",
              score < 50 && "[&>div]:bg-destructive"
            )}
          />
        </CardContent>
      </Card>

      {/* Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vitalConfigs.map((config) => (
          <VitalCard
            key={config.key}
            metric={config.metric}
            icon={config.icon}
            description={config.description}
            unit={config.unit}
            formatter={config.formatter}
          />
        ))}
      </div>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Understanding the Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-success text-success-foreground">good</Badge>
              <span className="text-muted-foreground">Meets Core Web Vitals thresholds</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-warning text-warning-foreground">needs-improvement</Badge>
              <span className="text-muted-foreground">Room for optimization</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">poor</Badge>
              <span className="text-muted-foreground">Requires immediate attention</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
