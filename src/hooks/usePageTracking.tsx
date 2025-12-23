import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('page_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('page_session_id', sessionId);
  }
  return sessionId;
}

export function usePageTracking() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await supabase.from('page_views').insert({
          path: location.pathname,
          user_id: user?.id || null,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
          browser: getBrowser(),
          session_id: getSessionId(),
        });
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        logger.debug('Page tracking failed:', error);
      }
    };

    // Small delay to ensure the page has fully loaded
    const timeout = setTimeout(trackPageView, 100);
    return () => clearTimeout(timeout);
  }, [location.pathname, user?.id]);
}

export function PageTrackingProvider({ children }: { children: React.ReactNode }) {
  usePageTracking();
  return <>{children}</>;
}
