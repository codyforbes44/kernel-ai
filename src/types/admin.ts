import type { Profile } from './database';

export interface SystemStats {
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

export interface AIUsageStats {
  id: string;
  user_id: string;
  model: string;
  function_name: string;
  tokens_input: number;
  tokens_output: number;
  credits_used: number;
  created_at: string;
  user_name?: string;
}

export interface LoginLocation {
  id: string;
  user_id: string;
  ip_address: string;
  country: string | null;
  city: string | null;
  region: string | null;
  login_count: number | null;
  is_trusted: boolean | null;
  first_seen_at: string;
  last_seen_at: string;
  user_name?: string;
}

export interface PageView {
  id: string;
  path: string;
  user_id: string | null;
  device_type: string | null;
  browser: string | null;
  country: string | null;
  created_at: string;
}

export interface UserWithStats extends Profile {
  email?: string;
  conversation_count?: number;
  message_count?: number;
  last_active?: string;
  is_admin?: boolean;
}

export interface ConversationWithUser {
  id: string;
  user_id: string;
  title: string;
  message_count: number | null;
  token_count: number | null;
  updated_at: string;
  user_name?: string;
}

export type DateRangeFilter = 'today' | '7days' | '30days' | 'all';

export const DATE_RANGE_OPTIONS = [
  { value: 'today' as const, label: 'Today' },
  { value: '7days' as const, label: 'Last 7 Days' },
  { value: '30days' as const, label: 'Last 30 Days' },
  { value: 'all' as const, label: 'All Time' },
];

export function getDateRangeStart(range: DateRangeFilter): Date | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  switch (range) {
    case 'today':
      return now;
    case '7days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
      return null;
  }
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return String(val);
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
