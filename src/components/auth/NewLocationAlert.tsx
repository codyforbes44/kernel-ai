import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LoginAlert {
  id: string;
  ip_address: string;
  city: string | null;
  country: string | null;
  alert_type: string;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  location_id?: string;
}

interface NewLocationAlertProps {
  alert: LoginAlert;
  onDismiss: (alertId: string) => void;
  onTrustLocation?: (locationId: string) => void;
}

export function NewLocationAlert({ alert, onDismiss, onTrustLocation }: NewLocationAlertProps) {
  const locationText = [alert.city, alert.country].filter(Boolean).join(', ') || 'Unknown location';
  const timeAgo = formatDistanceToNow(new Date(alert.created_at), { addSuffix: true });

  return (
    <Alert className="border-yellow-500/50 bg-yellow-500/10 relative">
      <MapPin className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
        New Login Location Detected
      </AlertTitle>
      <AlertDescription className="text-yellow-700/80 dark:text-yellow-400/80 mt-2">
        <p className="mb-2">
          A login was detected from <strong>{locationText}</strong> ({alert.ip_address}) {timeAgo}.
        </p>
        <p className="text-sm mb-3">
          If this was you, you can trust this location. If not, please change your password immediately.
        </p>
        <div className="flex gap-2 flex-wrap">
          {onTrustLocation && alert.location_id && (
            <Button
              size="sm"
              variant="outline"
              className="border-yellow-500/50 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20"
              onClick={() => onTrustLocation(alert.location_id!)}
            >
              <Shield className="h-3 w-3 mr-1" />
              Trust this location
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-yellow-700/70 dark:text-yellow-400/70"
            onClick={() => onDismiss(alert.id)}
          >
            <X className="h-3 w-3 mr-1" />
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
