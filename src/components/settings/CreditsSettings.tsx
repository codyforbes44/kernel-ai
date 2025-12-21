import { useState } from 'react';
import { Coins, TrendingUp, Clock, Zap, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAICredits } from '@/hooks/useAICredits';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CREDIT_PACKS = [
  { id: 'starter', credits: 1000, price: 5, name: 'Starter', popular: false },
  { id: 'standard', credits: 5000, price: 20, name: 'Standard', popular: true },
  { id: 'pro', credits: 15000, price: 50, name: 'Pro', popular: false },
  { id: 'enterprise', credits: 50000, price: 150, name: 'Enterprise', popular: false },
];

export function CreditsSettings() {
  const { toast } = useToast();
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  
  const {
    balance,
    totalPurchased,
    totalUsed,
    usageStats,
    usageHistory,
    isLoading,
    isLowBalance,
  } = useAICredits();

  const handlePurchase = async (packId: string) => {
    setIsPurchasing(packId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Please sign in', variant: 'destructive' });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-credit-purchase`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ packId }),
        }
      );

      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (error) {
      toast({
        title: 'Purchase failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const usagePercentage = totalPurchased > 0 
    ? Math.round((totalUsed / (totalPurchased + 1000)) * 100) // +1000 for initial free credits
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={cn(isLowBalance && 'border-destructive/50')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Coins className={cn('h-4 w-4', isLowBalance ? 'text-destructive' : 'text-muted-foreground')} />
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', isLowBalance && 'text-destructive')}>
              {balance.toLocaleString()}
            </div>
            {isLowBalance && (
              <p className="text-xs text-destructive mt-1">Low balance - purchase more credits</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsed.toLocaleString()}</div>
            <Progress value={usagePercentage} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchased</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchased.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">+ 1,000 free credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Credits */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Credits</CardTitle>
          <CardDescription>Choose a credit pack to power your AI features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={cn(
                  'relative rounded-lg border p-4 transition-colors hover:border-primary',
                  pack.popular && 'border-primary bg-primary/5'
                )}
              >
                {pack.popular && (
                  <Badge className="absolute -top-2 right-2" variant="default">
                    Popular
                  </Badge>
                )}
                <h4 className="font-semibold">{pack.name}</h4>
                <p className="text-2xl font-bold mt-2">${pack.price}</p>
                <p className="text-sm text-muted-foreground">
                  {pack.credits.toLocaleString()} credits
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${(pack.price / pack.credits * 1000).toFixed(2)} per 1K
                </p>
                <Button
                  className="w-full mt-4"
                  variant={pack.popular ? 'default' : 'outline'}
                  onClick={() => handlePurchase(pack.id)}
                  disabled={isPurchasing !== null}
                >
                  {isPurchasing === pack.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Purchase
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage by Function */}
      {Object.keys(usageStats.usageByFunction).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage by Feature</CardTitle>
            <CardDescription>Credits used by different AI features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(usageStats.usageByFunction).map(([fn, credits]) => (
                <div key={fn} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm capitalize">{fn.replace(/-/g, ' ')}</span>
                  </div>
                  <span className="text-sm font-medium">{credits.toLocaleString()} credits</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Usage</CardTitle>
          <CardDescription>Your latest AI credit usage</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {usageHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No usage history yet
              </p>
            ) : (
              <div className="space-y-2">
                {usageHistory.slice(0, 20).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {log.function_name.replace(/-/g, ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.model} • {log.tokens_input + log.tokens_output} tokens
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">-{log.credits_used}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}