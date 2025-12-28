import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeoLocation {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
}

interface LoginAlert {
  id: string;
  ip_address: string;
  city: string | null;
  country: string | null;
  alert_type: string;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

interface LocationCheckResult {
  isNewLocation: boolean;
  location: GeoLocation | null;
  alert?: LoginAlert;
}

export function useLoginGeolocation() {
  const [checking, setChecking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>(null);

  // Get IP and geolocation data using free API
  const getGeolocation = useCallback(async (): Promise<GeoLocation | null> => {
    try {
      // Using ip-api.com (free, no API key required, 45 requests/minute limit)
      const response = await fetch('https://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp,query');
      
      if (!response.ok) {
        // Fallback to ipify for just IP
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        return { ip: ipData.ip };
      }

      const data = await response.json();
      
      if (data.status === 'fail') {
        console.warn('Geolocation lookup failed:', data.message);
        return null;
      }

      return {
        ip: data.query,
        city: data.city,
        region: data.regionName,
        country: data.country,
        countryCode: data.countryCode,
        latitude: data.lat,
        longitude: data.lon,
        isp: data.isp,
      };
    } catch (error) {
      console.error('Error fetching geolocation:', error);
      return null;
    }
  }, []);

  // Check if this is a new location for the user
  const checkLoginLocation = useCallback(async (userId: string): Promise<LocationCheckResult> => {
    setChecking(true);
    try {
      const location = await getGeolocation();
      setCurrentLocation(location);

      if (!location) {
        return { isNewLocation: false, location: null };
      }

      // Check if this IP exists for this user
      const { data: existingLocation, error: selectError } = await supabase
        .from('user_login_locations')
        .select('*')
        .eq('user_id', userId)
        .eq('ip_address', location.ip)
        .maybeSingle();

      if (selectError) {
        console.error('Error checking login location:', selectError);
        return { isNewLocation: false, location };
      }

      if (existingLocation) {
        // Update last seen and increment login count
        await supabase
          .from('user_login_locations')
          .update({
            last_seen_at: new Date().toISOString(),
            login_count: (existingLocation.login_count || 0) + 1,
          })
          .eq('id', existingLocation.id);

        return { isNewLocation: false, location };
      }

      // This is a new location - insert it
      const { data: newLocation, error: insertError } = await supabase
        .from('user_login_locations')
        .insert({
          user_id: userId,
          ip_address: location.ip,
          city: location.city,
          region: location.region,
          country: location.country,
          country_code: location.countryCode,
          latitude: location.latitude,
          longitude: location.longitude,
          isp: location.isp,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error saving login location:', insertError);
        return { isNewLocation: true, location };
      }

      // Check if user has any previous locations (if this is their first login, don't alert)
      const { count } = await supabase
        .from('user_login_locations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Only create alert if user has logged in before from other locations
      if (count && count > 1) {
        const { data: alert } = await supabase
          .from('login_alerts')
          .insert({
            user_id: userId,
            location_id: newLocation?.id,
            ip_address: location.ip,
            city: location.city,
            country: location.country,
            alert_type: 'new_location',
          })
          .select()
          .single();

        return { 
          isNewLocation: true, 
          location,
          alert: alert as LoginAlert,
        };
      }

      return { isNewLocation: false, location };
    } finally {
      setChecking(false);
    }
  }, [getGeolocation]);

  // Get unread alerts for the user
  const getUnreadAlerts = useCallback(async (userId: string): Promise<LoginAlert[]> => {
    const { data, error } = await supabase
      .from('login_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching login alerts:', error);
      return [];
    }

    return (data || []) as LoginAlert[];
  }, []);

  // Mark alert as read
  const markAlertRead = useCallback(async (alertId: string) => {
    await supabase
      .from('login_alerts')
      .update({ is_read: true })
      .eq('id', alertId);
  }, []);

  // Dismiss alert
  const dismissAlert = useCallback(async (alertId: string) => {
    await supabase
      .from('login_alerts')
      .update({ is_dismissed: true })
      .eq('id', alertId);
  }, []);

  // Trust a location (mark as trusted so future logins don't trigger alerts)
  const trustLocation = useCallback(async (locationId: string) => {
    await supabase
      .from('user_login_locations')
      .update({ is_trusted: true })
      .eq('id', locationId);
  }, []);

  // Get all login locations for the user
  const getLoginLocations = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_login_locations')
      .select('*')
      .eq('user_id', userId)
      .order('last_seen_at', { ascending: false });

    if (error) {
      console.error('Error fetching login locations:', error);
      return [];
    }

    return data || [];
  }, []);

  return {
    checking,
    currentLocation,
    checkLoginLocation,
    getUnreadAlerts,
    markAlertRead,
    dismissAlert,
    trustLocation,
    getLoginLocations,
  };
}
