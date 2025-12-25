import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Mail, Users, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { exportToCSV } from '@/types/admin';

interface NewsletterSubscription {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
  source: string | null;
}

export function NewsletterSubscribersPanel() {
  const { data: subscribers = [], isLoading, refetch } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      return data as NewsletterSubscription[];
    },
  });

  const handleExport = () => {
    if (subscribers.length === 0) {
      toast.error('No subscribers to export');
      return;
    }

    const exportData = subscribers.map(sub => ({
      email: sub.email,
      subscribed_at: sub.subscribed_at,
      is_active: sub.is_active,
      source: sub.source || 'unknown',
    }));

    const filename = `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    exportToCSV(exportData, filename);
    toast.success(`Exported ${subscribers.length} subscribers`);
  };

  const activeCount = subscribers.filter(s => s.is_active).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Subscribers</CardTitle>
          <CardDescription>Loading subscribers...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Newsletter Subscribers
              <Badge variant="secondary" className="ml-2">
                {activeCount} active
              </Badge>
            </CardTitle>
            <CardDescription>
              Manage newsletter subscriptions from the footer signup form
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={subscribers.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-50" />
            <p>No newsletter subscribers yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <a 
                        href={`mailto:${subscriber.email}`} 
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {subscriber.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {subscriber.source || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subscriber.is_active ? (
                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(subscriber.subscribed_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
