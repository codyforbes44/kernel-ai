import { useState, useEffect } from 'react';
import { useLoginGeolocation } from '@/hooks/useLoginGeolocation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  MapPin,
  Shield,
  ShieldCheck,
  Trash2,
  Globe,
  Wifi,
  Clock,
  Hash,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LoginLocation {
  id: string;
  ip_address: string;
  city: string | null;
  region: string | null;
  country: string | null;
  country_code: string | null;
  isp: string | null;
  is_trusted: boolean | null;
  login_count: number | null;
  first_seen_at: string;
  last_seen_at: string;
}

interface LoginLocationsSettingsProps {
  userId: string;
}

export function LoginLocationsSettings({ userId }: LoginLocationsSettingsProps) {
  const [locations, setLocations] = useState<LoginLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { trustLocation, currentLocation } = useLoginGeolocation();

  const loadLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_login_locations')
        .select('*')
        .eq('user_id', userId)
        .order('last_seen_at', { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast.error('Failed to load login locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, [userId]);

  const handleTrustLocation = async (locationId: string) => {
    setActionLoading(locationId);
    try {
      await trustLocation(locationId);
      setLocations(prev =>
        prev.map(loc =>
          loc.id === locationId ? { ...loc, is_trusted: true } : loc
        )
      );
      toast.success('Location marked as trusted');
    } catch (error) {
      toast.error('Failed to trust location');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveLocation = async (locationId: string) => {
    setActionLoading(locationId);
    try {
      const { error } = await supabase
        .from('user_login_locations')
        .delete()
        .eq('id', locationId);

      if (error) throw error;

      setLocations(prev => prev.filter(loc => loc.id !== locationId));
      toast.success('Location removed');
    } catch (error) {
      toast.error('Failed to remove location');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUntrustLocation = async (locationId: string) => {
    setActionLoading(locationId);
    try {
      const { error } = await supabase
        .from('user_login_locations')
        .update({ is_trusted: false })
        .eq('id', locationId);

      if (error) throw error;

      setLocations(prev =>
        prev.map(loc =>
          loc.id === locationId ? { ...loc, is_trusted: false } : loc
        )
      );
      toast.success('Location no longer trusted');
    } catch (error) {
      toast.error('Failed to update location');
    } finally {
      setActionLoading(null);
    }
  };

  const formatLocationName = (location: LoginLocation) => {
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.region && location.region !== location.city) parts.push(location.region);
    if (location.country) parts.push(location.country);
    return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
  };

  const isCurrentLocation = (location: LoginLocation) => {
    return currentLocation?.ip === location.ip_address;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Login Locations
          </CardTitle>
          <CardDescription>Manage devices and locations where you've signed in</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Login Locations
        </CardTitle>
        <CardDescription>
          Manage devices and locations where you've signed in. Mark locations as trusted to prevent alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {locations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No login locations recorded yet.</p>
            <p className="text-sm">Sign in again to start tracking locations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {locations.map((location, index) => (
              <div key={location.id}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatLocationName(location)}</span>
                      {location.country_code && (
                        <span className="text-lg" role="img" aria-label={location.country || ''}>
                          {getFlagEmoji(location.country_code)}
                        </span>
                      )}
                      {isCurrentLocation(location) && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {location.is_trusted && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Trusted
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-3.5 w-3.5" />
                        <span className="truncate" title={location.ip_address}>
                          IP: {location.ip_address}
                        </span>
                      </div>
                      {location.isp && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5" />
                          <span className="truncate" title={location.isp}>
                            {location.isp}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Last: {format(new Date(location.last_seen_at), 'MMM d, yyyy HH:mm')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5" />
                        <span>{location.login_count || 1} login{(location.login_count || 1) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      First seen: {format(new Date(location.first_seen_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {location.is_trusted ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUntrustLocation(location.id)}
                        disabled={actionLoading === location.id}
                        className="gap-1.5"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Untrust</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrustLocation(location.id)}
                        disabled={actionLoading === location.id}
                        className="gap-1.5"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Trust</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveLocation(location.id)}
                      disabled={actionLoading === location.id}
                      className="gap-1.5 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to convert country code to flag emoji
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
