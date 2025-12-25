import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Smartphone,
  Download,
  RefreshCw,
  Wifi,
  WifiOff,
  Trash2,
  HardDrive,
  Check,
  AlertCircle,
  Loader2,
  Cloud,
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { APP_VERSION } from '@/lib/version';

export function PWASettingsCard() {
  const {
    isInstallable,
    isInstalled,
    needRefresh,
    offlineReady,
    installApp,
    refreshApp,
  } = usePWA();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [lastUpdateCheck, setLastUpdateCheck] = useState<Date | null>(null);
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(null);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(() => {
    return localStorage.getItem('pwa-auto-update') !== 'false';
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get storage estimate
  useEffect(() => {
    const getStorageEstimate = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          setStorageEstimate({
            usage: estimate.usage || 0,
            quota: estimate.quota || 0,
          });
        } catch (error) {
          console.error('Failed to get storage estimate:', error);
        }
      }
    };

    getStorageEstimate();
  }, []);

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration) {
        await registration.update();
        setLastUpdateCheck(new Date());
        
        if (registration.waiting) {
          toast.success('Update available! Click refresh to apply.');
        } else {
          toast.success('You have the latest version');
        }
      } else {
        toast.info('No service worker registered');
      }
    } catch (error) {
      console.error('Update check failed:', error);
      toast.error('Failed to check for updates');
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        // Update storage estimate
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          setStorageEstimate({
            usage: estimate.usage || 0,
            quota: estimate.quota || 0,
          });
        }
        
        toast.success('Cache cleared successfully');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache');
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleAutoUpdateChange = (enabled: boolean) => {
    setAutoUpdate(enabled);
    localStorage.setItem('pwa-auto-update', String(enabled));
    toast.success(enabled ? 'Auto-update enabled' : 'Auto-update disabled');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatLastCheck = () => {
    if (!lastUpdateCheck) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastUpdateCheck.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return lastUpdateCheck.toLocaleDateString();
  };

  const getPwaStatus = () => {
    if (isInstalled) {
      return { label: 'Installed', variant: 'default' as const, icon: Check };
    }
    if (isInstallable) {
      return { label: 'Available', variant: 'secondary' as const, icon: Download };
    }
    return { label: 'Not Available', variant: 'outline' as const, icon: AlertCircle };
  };

  const pwaStatus = getPwaStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          App & Updates
        </CardTitle>
        <CardDescription>Manage app installation and updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Version & Update Section */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Cloud className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Version {APP_VERSION}</p>
              <p className="text-xs text-muted-foreground">
                Last checked: {formatLastCheck()}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckForUpdates}
            disabled={isCheckingUpdates}
            className="gap-2"
          >
            {isCheckingUpdates ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Check Updates
          </Button>
        </div>

        {/* Update Available Banner */}
        {needRefresh && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Update Available</span>
            </div>
            <Button size="sm" onClick={refreshApp} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Update Now
            </Button>
          </div>
        )}

        <Separator />

        {/* Installation Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              App Installation
            </Label>
            <p className="text-sm text-muted-foreground">
              {isInstalled
                ? 'App is installed on your device'
                : isInstallable
                ? 'Install for offline access'
                : 'Installation not supported'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={pwaStatus.variant} className="gap-1">
              <pwaStatus.icon className="h-3 w-3" />
              {pwaStatus.label}
            </Badge>
            {isInstallable && !isInstalled && (
              <Button size="sm" variant="outline" onClick={installApp} className="gap-2">
                <Download className="h-4 w-4" />
                Install
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Offline Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
              Connection Status
            </Label>
            <p className="text-sm text-muted-foreground">
              {isOnline ? 'Connected to the internet' : 'You are currently offline'}
            </p>
          </div>
          <Badge variant={isOnline ? 'default' : 'destructive'} className="gap-1">
            {isOnline ? (
              <>
                <Check className="h-3 w-3" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Offline
              </>
            )}
          </Badge>
        </div>

        {offlineReady && (
          <div className="text-xs text-success flex items-center gap-1 pl-6">
            <Check className="h-3 w-3" />
            App is ready for offline use
          </div>
        )}

        <Separator />

        {/* Storage & Cache */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              Cached Data
            </Label>
            <p className="text-sm text-muted-foreground">
              {storageEstimate
                ? `${formatBytes(storageEstimate.usage)} used`
                : 'Calculating...'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            disabled={isClearingCache}
            className="gap-2"
          >
            {isClearingCache ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Clear Cache
          </Button>
        </div>

        <Separator />

        {/* Auto-update Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              Auto-update
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically apply updates when available
            </p>
          </div>
          <Switch checked={autoUpdate} onCheckedChange={handleAutoUpdateChange} />
        </div>
      </CardContent>
    </Card>
  );
}
