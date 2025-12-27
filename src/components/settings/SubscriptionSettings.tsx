import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Crown, User, ExternalLink, Loader2 } from 'lucide-react';
import { CreditsSettings } from './CreditsSettings';

export function SubscriptionSettings() {
  const navigate = useNavigate();
  const { subscribed, plan, subscriptionEnd, isLoading, openCustomerPortal } = useSubscription();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>Manage your plan and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading subscription...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${subscribed ? 'bg-primary/10' : 'bg-muted'}`}>
                    {subscribed ? (
                      <Crown className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{plan} Plan</span>
                      {subscribed && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                          Active
                        </Badge>
                      )}
                    </div>
                    {subscriptionEnd && (
                      <p className="text-sm text-muted-foreground">
                        Renews on {new Date(subscriptionEnd).toLocaleDateString()}
                      </p>
                    )}
                    {!subscribed && (
                      <p className="text-sm text-muted-foreground">
                        Upgrade to unlock unlimited features
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {subscribed ? (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={async () => {
                      setIsOpeningPortal(true);
                      try {
                        await openCustomerPortal();
                      } finally {
                        setIsOpeningPortal(false);
                      }
                    }}
                    disabled={isOpeningPortal}
                  >
                    {isOpeningPortal ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    Manage Subscription
                  </Button>
                ) : (
                  <Button
                    className="gap-2 bg-gold hover:bg-gold/90 text-gold-foreground shadow-[0_0_15px_hsl(var(--gold)/0.3)]"
                    onClick={() => navigate('/pricing')}
                  >
                    <Crown className="h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CreditsSettings />
    </>
  );
}
