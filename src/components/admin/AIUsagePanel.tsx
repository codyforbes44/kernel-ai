import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cpu, Search, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { DateRangeFilterSelect } from './DateRangeFilter';
import { ExportButton } from './ExportButton';
import { RefreshButton } from './RefreshButton';
import { EmptyState } from './EmptyState';
import { type AIUsageStats, type DateRangeFilter, getDateRangeStart } from '@/types/admin';

interface AIUsagePanelProps {
  logs: AIUsageStats[];
  modelBreakdown: Record<string, number>;
  loading?: boolean;
  onRefresh?: () => void;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function AIUsagePanel({ logs, modelBreakdown, loading, onRefresh }: AIUsagePanelProps) {
  const [search, setSearch] = useState('');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('7days');

  const models = useMemo(() => {
    return [...new Set(logs.map(l => l.model))];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const dateStart = getDateRangeStart(dateRange);
    
    return logs.filter(log => {
      const matchesSearch = 
        log.function_name.toLowerCase().includes(search.toLowerCase()) ||
        log.model.toLowerCase().includes(search.toLowerCase()) ||
        log.user_id.toLowerCase().includes(search.toLowerCase());
      const matchesModel = modelFilter === 'all' || log.model === modelFilter;
      const matchesDate = !dateStart || new Date(log.created_at) >= dateStart;
      return matchesSearch && matchesModel && matchesDate;
    });
  }, [logs, search, modelFilter, dateRange]);

  const pieData = useMemo(() => {
    const breakdown: Record<string, number> = {};
    filteredLogs.forEach(log => {
      breakdown[log.model] = (breakdown[log.model] || 0) + 1;
    });
    return Object.entries(breakdown).map(([name, value]) => ({
      name: name.split('/').pop() || name,
      value,
    }));
  }, [filteredLogs]);

  const functionBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    filteredLogs.forEach(log => {
      breakdown[log.function_name] = (breakdown[log.function_name] || 0) + 1;
    });
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }, [filteredLogs]);

  const totalTokens = useMemo(() => {
    return filteredLogs.reduce((sum, l) => sum + l.tokens_input + l.tokens_output, 0);
  }, [filteredLogs]);

  const totalCredits = useMemo(() => {
    return filteredLogs.reduce((sum, l) => sum + l.credits_used, 0);
  }, [filteredLogs]);

  const exportData = useMemo(() => {
    return filteredLogs.map(log => ({
      id: log.id,
      function: log.function_name,
      model: log.model,
      tokens_input: log.tokens_input,
      tokens_output: log.tokens_output,
      credits_used: log.credits_used,
      user_id: log.user_id,
      created_at: format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
    }));
  }, [filteredLogs]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Usage Logs</CardTitle>
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
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Cpu className="h-4 w-4" />
              Total Requests
            </div>
            <p className="text-2xl font-bold">{filteredLogs.length.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Zap className="h-4 w-4" />
              Total Tokens
            </div>
            <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              Credits Used
            </div>
            <p className="text-2xl font-bold">{totalCredits.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Model Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <EmptyState icon={Cpu} title="No data" className="h-48" />
            ) : (
              <div className="h-48" role="img" aria-label="Pie chart showing AI model usage distribution">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Functions</CardTitle>
          </CardHeader>
          <CardContent>
            {functionBreakdown.length === 0 ? (
              <EmptyState icon={Zap} title="No data" className="h-48" />
            ) : (
              <div className="h-48" role="img" aria-label="Bar chart showing top AI functions by usage">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={functionBreakdown} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                AI Usage Logs
              </CardTitle>
              <CardDescription>Recent AI model invocations across the system</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ExportButton data={exportData} filenamePrefix="ai-usage" />
              {onRefresh && <RefreshButton onRefresh={onRefresh} loading={loading} />}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by function, model, user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {models.map(model => (
                  <SelectItem key={model} value={model}>
                    {model.split('/').pop()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DateRangeFilterSelect value={dateRange} onChange={setDateRange} />
          </div>

          {filteredLogs.length === 0 ? (
            <EmptyState 
              icon={Cpu} 
              title="No logs found" 
              description="Try adjusting your filters or date range"
            />
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Function</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead className="hidden sm:table-cell">User</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {log.function_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{log.model.split('/').pop()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600 dark:text-green-400">{log.tokens_input}</span>
                          {' / '}
                          <span className="text-blue-600 dark:text-blue-400">{log.tokens_output}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.credits_used}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.user_id.slice(0, 8)}...
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, HH:mm')}
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
