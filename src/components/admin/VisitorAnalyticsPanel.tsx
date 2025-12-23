import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Monitor, Smartphone, Tablet, Clock, Users } from 'lucide-react';
import { format, subDays, startOfDay, isAfter } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DateRangeFilterSelect } from './DateRangeFilter';
import { ExportButton } from './ExportButton';
import { RefreshButton } from './RefreshButton';
import { EmptyState } from './EmptyState';
import { type PageView, type DateRangeFilter, getDateRangeStart } from '@/types/admin';

interface VisitorAnalyticsPanelProps {
  pageViews: PageView[];
  loading?: boolean;
  onRefresh?: () => void;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
];

export function VisitorAnalyticsPanel({ pageViews, loading, onRefresh }: VisitorAnalyticsPanelProps) {
  const [dateRange, setDateRange] = useState<DateRangeFilter>('7days');

  const filteredViews = useMemo(() => {
    const dateStart = getDateRangeStart(dateRange);
    if (!dateStart) return pageViews;
    return pageViews.filter(pv => new Date(pv.created_at) >= dateStart);
  }, [pageViews, dateRange]);

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const weekAgo = subDays(today, 7);

    const todayViews = filteredViews.filter(pv => isAfter(new Date(pv.created_at), today));
    const weekViews = filteredViews.filter(pv => isAfter(new Date(pv.created_at), weekAgo));
    const uniqueVisitors = new Set(filteredViews.filter(pv => pv.user_id).map(pv => pv.user_id)).size;
    const anonymousViews = filteredViews.filter(pv => !pv.user_id).length;

    return {
      totalViews: filteredViews.length,
      todayViews: todayViews.length,
      weekViews: weekViews.length,
      uniqueVisitors,
      anonymousViews,
    };
  }, [filteredViews]);

  const pageBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    filteredViews.forEach(pv => {
      breakdown[pv.path] = (breakdown[pv.path] || 0) + 1;
    });
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));
  }, [filteredViews]);

  const deviceBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    filteredViews.forEach(pv => {
      const device = pv.device_type || 'unknown';
      breakdown[device] = (breakdown[device] || 0) + 1;
    });
    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [filteredViews]);

  const browserBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    filteredViews.forEach(pv => {
      const browser = pv.browser || 'Unknown';
      breakdown[browser] = (breakdown[browser] || 0) + 1;
    });
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [filteredViews]);

  const dailyViews = useMemo(() => {
    const days: Record<string, number> = {};
    const numDays = dateRange === 'today' ? 1 : dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 7;
    const last7Days = Array.from({ length: Math.min(numDays, 14) }, (_, i) => {
      const date = subDays(new Date(), numDays - 1 - i);
      return format(date, 'MMM d');
    });

    last7Days.forEach(day => { days[day] = 0; });

    filteredViews.forEach(pv => {
      const day = format(new Date(pv.created_at), 'MMM d');
      if (days[day] !== undefined) {
        days[day]++;
      }
    });

    return Object.entries(days).map(([date, views]) => ({ date, views }));
  }, [filteredViews, dateRange]);

  const exportData = useMemo(() => {
    return filteredViews.map(pv => ({
      id: pv.id,
      path: pv.path,
      device: pv.device_type || 'unknown',
      browser: pv.browser || 'Unknown',
      user_id: pv.user_id || 'anonymous',
      created_at: format(new Date(pv.created_at), 'yyyy-MM-dd HH:mm:ss'),
    }));
  }, [filteredViews]);

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visitor Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Visitor Analytics</h2>
        <div className="flex items-center gap-2">
          <DateRangeFilterSelect value={dateRange} onChange={setDateRange} />
          <ExportButton data={exportData} filenamePrefix="page-views" />
          {onRefresh && <RefreshButton onRefresh={onRefresh} loading={loading} />}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Eye className="h-4 w-4" />
              Total Views
            </div>
            <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Clock className="h-4 w-4" />
              Today
            </div>
            <p className="text-2xl font-bold">{stats.todayViews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              This Week
            </div>
            <p className="text-2xl font-bold">{stats.weekViews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Users className="h-4 w-4" />
              Unique
            </div>
            <p className="text-2xl font-bold">{stats.uniqueVisitors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              Anonymous
            </div>
            <p className="text-2xl font-bold">{stats.anonymousViews}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Daily Views Chart */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Page Views Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyViews.length === 0 ? (
              <EmptyState icon={Eye} title="No data" className="h-48" />
            ) : (
              <div className="h-48" role="img" aria-label="Line chart showing page views over time">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyViews}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} width={30} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            {deviceBreakdown.length === 0 ? (
              <EmptyState icon={Monitor} title="No data" className="h-48" />
            ) : (
              <>
                <div className="h-48" role="img" aria-label="Pie chart showing device distribution">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {deviceBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {deviceBreakdown.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs text-muted-foreground capitalize">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Pages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {pageBreakdown.length === 0 ? (
              <EmptyState icon={Eye} title="No data" className="h-48" />
            ) : (
              <div className="h-48" role="img" aria-label="Bar chart showing top pages by views">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pageBreakdown} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis 
                      dataKey="path" 
                      type="category" 
                      tick={{ fontSize: 10 }} 
                      width={100}
                      tickFormatter={(v) => v.length > 15 ? v.slice(0, 15) + '...' : v}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Browser Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            {browserBreakdown.length === 0 ? (
              <EmptyState icon={Monitor} title="No data" className="h-48" />
            ) : (
              <div className="h-48" role="img" aria-label="Bar chart showing browser distribution">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={browserBreakdown}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} width={30} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Page Views */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Page Views
          </CardTitle>
          <CardDescription>Latest visitor activity</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredViews.length === 0 ? (
            <EmptyState 
              icon={Eye} 
              title="No page views" 
              description="Page views will appear here as visitors browse your app"
            />
          ) : (
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead className="hidden sm:table-cell">Browser</TableHead>
                    <TableHead className="hidden md:table-cell">User</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredViews.slice(0, 50).map((pv) => (
                    <TableRow key={pv.id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {pv.path}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getDeviceIcon(pv.device_type || 'desktop')}
                          <span className="text-sm capitalize hidden sm:inline">{pv.device_type || 'desktop'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className="text-xs">
                          {pv.browser || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {pv.user_id ? (
                          <span className="text-xs font-mono text-muted-foreground">
                            {pv.user_id.slice(0, 8)}...
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-xs">Anonymous</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(pv.created_at), 'MMM d, HH:mm')}
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
