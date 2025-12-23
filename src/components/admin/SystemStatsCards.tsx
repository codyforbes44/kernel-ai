import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, Zap, CreditCard, UserPlus, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemStats {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  newUsersToday: number;
  newUsersWeek: number;
  totalMessages: number;
  totalConversations: number;
  totalTokens: number;
  totalCreditsUsed: number;
  totalCreditsPurchased: number;
  avgCreditsBalance: number;
  suspendedUsers: number;
}

interface SystemStatsCardsProps {
  stats: SystemStats | null;
  loading?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function SystemStatsCards({ stats, loading }: SystemStatsCardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-10 w-10 bg-muted rounded-lg mb-3" />
              <div className="h-8 w-16 bg-muted rounded mb-1" />
              <div className="h-4 w-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Active Today',
      value: stats.activeUsersToday,
      icon: UserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'New This Week',
      value: stats.newUsersWeek,
      icon: UserPlus,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Suspended',
      value: stats.suspendedUsers,
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Total Messages',
      value: formatNumber(stats.totalMessages),
      icon: MessageSquare,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      label: 'Total Tokens',
      value: formatNumber(stats.totalTokens),
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Credits Used',
      value: formatNumber(stats.totalCreditsUsed),
      icon: CreditCard,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      label: 'Avg Balance',
      value: formatNumber(stats.avgCreditsBalance),
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className={cn('p-2 rounded-lg w-fit', stat.bgColor)}>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </div>
            <p className="text-2xl font-bold mt-3">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
