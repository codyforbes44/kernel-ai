import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const OFFLINE_DELAY_MS = 3000; // Wait 3 seconds before showing offline
const CONNECTIVITY_CHECK_INTERVAL_MS = 30000; // Check every 30 seconds when offline

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const offlineTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSuccessfulApiCallRef = useRef<number>(Date.now());

  // Track successful API calls
  const markApiSuccess = useCallback(() => {
    lastSuccessfulApiCallRef.current = Date.now();
    if (!isOnline) {
      setIsOnline(true);
    }
  }, [isOnline]);

  // Verify connectivity by pinging Supabase
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      setIsChecking(true);
      // Simple health check - try to get session (lightweight call)
      const { error } = await supabase.auth.getSession();
      setIsChecking(false);
      
      if (!error) {
        markApiSuccess();
        return true;
      }
      return false;
    } catch {
      setIsChecking(false);
      return false;
    }
  }, [markApiSuccess]);

  // Manual retry function
  const retryConnection = useCallback(async () => {
    const online = await checkConnectivity();
    setIsOnline(online);
    return online;
  }, [checkConnectivity]);

  useEffect(() => {
    const handleOnline = async () => {
      // Clear any pending offline timeout
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current);
        offlineTimeoutRef.current = null;
      }
      
      // Verify actual connectivity before marking online
      const actuallyOnline = await checkConnectivity();
      if (actuallyOnline) {
        setIsOnline(true);
      }
    };

    const handleOffline = () => {
      // Don't immediately go offline - wait for the delay
      // This prevents flickering on brief network hiccups
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current);
      }

      offlineTimeoutRef.current = setTimeout(async () => {
        // Double-check with a real connectivity test
        const stillOnline = await checkConnectivity();
        if (!stillOnline) {
          // Only mark offline if we've had no successful API calls recently
          const timeSinceLastSuccess = Date.now() - lastSuccessfulApiCallRef.current;
          if (timeSinceLastSuccess > OFFLINE_DELAY_MS) {
            setIsOnline(false);
          }
        }
      }, OFFLINE_DELAY_MS);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic connectivity check when offline
    const intervalId = setInterval(async () => {
      if (!isOnline) {
        const online = await checkConnectivity();
        if (online) {
          setIsOnline(true);
        }
      }
    }, CONNECTIVITY_CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current);
      }
      clearInterval(intervalId);
    };
  }, [isOnline, checkConnectivity]);

  return { isOnline, isChecking, retryConnection, markApiSuccess };
}
