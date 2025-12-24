import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Smartphone, RefreshCw, Check, Clock, Loader2 } from 'lucide-react';
import { APP_VERSION } from '@/lib/version';
import { usePWA } from '@/hooks/usePWA';
import { getServiceWorkerRegistration } from '@/hooks/usePWA';

export function SystemInfoCard() {
  const { isInstalled, isInstallable, installApp, needRefresh, refreshApp } = usePWA();
  const [lastUpdateCheck, setLastUpdateCheck] = useState<Date | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  // Track when updates are checked
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setLastUpdateCheck(new Date());
      }
    };
    
    // Set initial check time
    setLastUpdateCheck(new Date());
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    try {
      const registration = getServiceWorkerRegistration();
      if (registration) {
        await registration.update();
        setLastUpdateCheck(new Date());
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleInstall = async () => {
    await installApp();
  };

  const formatLastCheck = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleDateString();
  };

  const getPwaStatus = () => {
    if (isInstalled) {
      return { label: 'Installed', variant: 'default' as const, icon: Check };
    }
    if (isInstallable) {
      return { label: 'Available', variant: 'secondary' as const, icon: Smartphone };
    }
    return { label: 'Not Available', variant: 'outline' as const, icon: Smartphone };
  };

  const pwaStatus = getPwaStatus();
  const PwaIcon = pwaStatus.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          System Information
        </CardTitle>
        <CardDescription>App version and installation status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Version Info */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">App Version</p>
              <p className="text-xs text-muted-foreground">Current version installed</p>
            </div>
          </div>
          <Badge variant="secondary" className="font-mono">v{APP_VERSION}</Badge>
        </div>

        {/* Last Update Check */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Last Update Check</p>
              <p className="text-xs text-muted-foreground">{formatLastCheck(lastUpdateCheck)}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCheckForUpdates}
            disabled={isCheckingUpdate}
            className="gap-2"
          >
            {isCheckingUpdate ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Check
          </Button>
        </div>

        {/* PWA Install Status */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isInstalled ? 'bg-green-500/10' : 'bg-muted'}`}>
              <PwaIcon className={`h-4 w-4 ${isInstalled ? 'text-green-500' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-sm font-medium">PWA Status</p>
              <p className="text-xs text-muted-foreground">
                {isInstalled 
                  ? 'Running as installed app' 
                  : isInstallable 
                    ? 'Can be installed on your device'
                    : 'PWA not supported in this browser'}
              </p>
            </div>
          </div>
          {isInstallable && !isInstalled ? (
            <Button variant="outline" size="sm" onClick={handleInstall} className="gap-2">
              <Smartphone className="h-3 w-3" />
              Install
            </Button>
          ) : (
            <Badge variant={pwaStatus.variant}>{pwaStatus.label}</Badge>
          )}
        </div>

        {/* Update Available Banner */}
        {needRefresh && (
          <div className="p-3 rounded-lg border border-primary/50 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Update Available</span>
              </div>
              <Button size="sm" onClick={refreshApp} className="gap-2">
                <RefreshCw className="h-3 w-3" />
                Update Now
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
