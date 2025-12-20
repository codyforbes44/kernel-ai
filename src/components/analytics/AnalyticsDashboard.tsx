import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { MessageSquare, Zap, MessagesSquare, FileText, TrendingUp, Calendar, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsDashboardProps {
  variant?: "compact" | "full";
  showExport?: boolean;
}

export function AnalyticsDashboard({ variant = "compact", showExport = false }: AnalyticsDashboardProps) {
  const { summary, chartData, loading } = useAnalytics();
  const [activeTab, setActiveTab] = useState<"overview" | "messages" | "tokens">("overview");

  const handleExport = () => {
    const csvContent = [
      ["Date", "Messages", "Tokens", "Conversations", "Templates"],
      ...chartData.map((d) => [d.date, d.messages, d.tokens, d.conversations || 0, d.templates || 0]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <AnalyticsSkeleton variant={variant} />;
  }

  const stats = [
    {
      label: "Total Messages",
      value: summary.totalMessages,
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: calculateTrend(chartData, "messages"),
    },
    {
      label: "Tokens Used",
      value: formatNumber(summary.totalTokens),
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      trend: calculateTrend(chartData, "tokens"),
    },
    {
      label: "Conversations",
      value: summary.totalConversations,
      icon: MessagesSquare,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      trend: null,
    },
    {
      label: "Templates Used",
      value: summary.totalTemplates,
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      trend: null,
    },
  ];

  // Pie chart data for message distribution
  const pieData = [
    { name: "User", value: Math.floor(summary.totalMessages * 0.5), color: "hsl(var(--primary))" },
    { name: "Assistant", value: Math.floor(summary.totalMessages * 0.48), color: "hsl(var(--muted-foreground))" },
    { name: "System", value: Math.floor(summary.totalMessages * 0.02), color: "hsl(var(--accent))" },
  ];

  if (variant === "compact") {
    return (
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-md", stat.bgColor)}>
                  <stat.icon className={cn("h-3 w-3", stat.color)} />
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {stat.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg font-bold">{stat.value}</p>
                {stat.trend !== null && <TrendBadge value={stat.trend} />}
              </div>
            </div>
          ))}
        </div>

        {/* Today's Activity */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Today</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Messages</span>
            <span className="font-medium">{summary.todayMessages}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tokens</span>
            <span className="font-medium">{formatNumber(summary.todayTokens)}</span>
          </div>
        </div>

        {/* Mini Chart */}
        {chartData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Messages (30 days)</span>
              </div>
              {showExport && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleExport}>
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              )}
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMessages)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Weekly Average */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
          <span className="text-xs text-muted-foreground">Weekly Average</span>
          <div className="flex justify-between mt-1">
            <div>
              <span className="text-sm font-medium">{summary.avgMessagesPerWeek}</span>
              <span className="text-xs text-muted-foreground ml-1">msgs</span>
            </div>
            <div>
              <span className="text-sm font-medium">{formatNumber(summary.avgTokensPerWeek)}</span>
              <span className="text-xs text-muted-foreground ml-1">tokens</span>
            </div>
          </div>
        </div>

        {chartData.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <p>No usage data yet.</p>
            <p className="text-xs mt-1">Start chatting to see analytics!</p>
          </div>
        )}
      </div>
    );
  }

  // Full variant for admin panel
  return (
    <div className="space-y-6">
      {/* Header with export */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analytics Overview</h3>
          <p className="text-sm text-muted-foreground">Last 30 days activity</p>
        </div>
        {showExport && (
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                {stat.trend !== null && <TrendBadge value={stat.trend} />}
              </div>
              <p className="text-2xl font-bold mt-3">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabbed Charts */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Area Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Activity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorMsgFull" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="messages" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorMsgFull)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Message Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Messages Over Time</CardTitle>
              <CardDescription>Daily message count for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="messages" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
              <CardDescription>Daily token consumption for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} width={50} tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="tokens" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-sm font-medium capitalize">{item.name}:</span>
          <span className="text-sm">{formatNumber(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Trend badge component
function TrendBadge({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium",
        isPositive ? "text-green-600" : "text-red-600"
      )}
    >
      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  );
}

// Calculate trend percentage from chart data
function calculateTrend(data: any[], key: string): number {
  if (data.length < 14) return 0;
  
  const recent = data.slice(-7).reduce((sum, d) => sum + (d[key] || 0), 0);
  const previous = data.slice(-14, -7).reduce((sum, d) => sum + (d[key] || 0), 0);
  
  if (previous === 0) return recent > 0 ? 100 : 0;
  return Math.round(((recent - previous) / previous) * 100);
}

// Loading skeleton
function AnalyticsSkeleton({ variant }: { variant: "compact" | "full" }) {
  if (variant === "compact") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-lg mb-3" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-lg" />
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
