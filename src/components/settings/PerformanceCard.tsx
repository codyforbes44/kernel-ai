import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useLiteMode } from '@/hooks/useLiteMode';
import { toast } from 'sonner';
import { Zap, Battery, Wifi } from 'lucide-react';

export function PerformanceCard() {
  const { isLiteMode, toggleLiteMode, reason } = useLiteMode();

  const getReasonBadge = () => {
    if (!isLiteMode) return null;
    
    switch (reason) {
      case 'battery':
        return (
          <Badge variant="secondary" className="gap-1">
            <Battery className="h-3 w-3" />
            Battery Saver
          </Badge>
        );
      case 'performance':
        return (
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            Performance
          </Badge>
        );
      case 'user':
        return (
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            Manual
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleToggle = (enabled: boolean) => {
    toggleLiteMode();
    toast.success(enabled ? 'Lite Mode enabled - 3D effects disabled' : 'Lite Mode disabled - full effects restored');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Performance
        </CardTitle>
        <CardDescription>Optimize for speed and battery life</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label>Lite Mode</Label>
              {getReasonBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              Disable 3D backgrounds and complex animations for better performance
            </p>
          </div>
          <Switch
            checked={isLiteMode}
            onCheckedChange={handleToggle}
          />
        </div>
        
        <Separator />
        
        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
          <p className="text-xs font-medium">Auto-detection</p>
          <p className="text-xs text-muted-foreground">
            Lite Mode automatically activates when your device is in battery saver mode or on a slow network connection.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
