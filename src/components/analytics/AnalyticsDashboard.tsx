import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { MessageSquare, Zap, MessagesSquare, FileText, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnalyticsDashboard() {
  const { summary, chartData, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Messages",
      value: summary.totalMessages,
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Tokens Used",
      value: formatNumber(summary.totalTokens),
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Conversations",
      value: summary.totalConversations,
      icon: MessagesSquare,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Templates Used",
      value: summary.totalTemplates,
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-3 rounded-lg bg-muted/30 border border-border/50"
          >
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-md", stat.bgColor)}>
                <stat.icon className={cn("h-3 w-3", stat.color)} />
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {stat.label}
              </span>
            </div>
            <p className="text-lg font-bold mt-1">{stat.value}</p>
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

      {/* Messages Chart */}
      {chartData.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">Messages (30 days)</span>
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
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

      {/* Tokens Chart */}
      {chartData.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-medium">Tokens (30 days)</span>
          </div>
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="tokens"
                  fill="hsl(var(--primary))"
                  radius={[2, 2, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
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

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
