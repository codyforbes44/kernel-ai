import { useState } from 'react';
import { 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  RefreshCw,
  Monitor,
  Tablet,
  Smartphone,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DeploymentPreviewProps {
  url: string;
  title?: string;
  onClose?: () => void;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const DEVICE_SIZES: Record<DeviceType, { width: string; height: string }> = {
  desktop: { width: '100%', height: '100%' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '667px' },
};

export function DeploymentPreview({ url, title, onClose }: DeploymentPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  const deviceSize = DEVICE_SIZES[device];

  return (
    <div 
      className={cn(
        "flex flex-col bg-background border border-border rounded-lg overflow-hidden transition-all duration-200",
        isExpanded 
          ? "fixed inset-4 z-50 shadow-2xl" 
          : "relative h-[400px]"
      )}
    >
      {/* Backdrop for expanded mode */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={url}>
            {title || url}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Device toggles */}
          <div className="flex items-center border border-border rounded-md overflow-hidden mr-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 rounded-none",
                device === 'desktop' && "bg-primary/20 text-primary"
              )}
              onClick={() => setDevice('desktop')}
              title="Desktop view"
            >
              <Monitor className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 rounded-none border-x border-border",
                device === 'tablet' && "bg-primary/20 text-primary"
              )}
              onClick={() => setDevice('tablet')}
              title="Tablet view"
            >
              <Tablet className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 rounded-none",
                device === 'mobile' && "bg-primary/20 text-primary"
              )}
              onClick={() => setDevice('mobile')}
              title="Mobile view"
            >
              <Smartphone className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleRefresh}
            title="Refresh preview"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="h-3 w-3" />
          </a>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
              title="Close preview"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* iframe container */}
      <div className="flex-1 bg-muted/20 flex items-center justify-center overflow-hidden">
        <div
          className={cn(
            "bg-background transition-all duration-200 shadow-lg",
            device !== 'desktop' && "rounded-lg border border-border"
          )}
          style={{
            width: deviceSize.width,
            height: deviceSize.height,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          <iframe
            key={key}
            src={url}
            className="w-full h-full border-0"
            title={title || "Deployment Preview"}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
