import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LockoutStatus {
  locked: boolean;
  remainingSeconds?: number;
  attempts: number;
  maxAttempts: number;
  remainingAttempts?: number;
}

export function useAccountLockout() {
  const [lockoutStatus, setLockoutStatus] = useState<LockoutStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const checkLockout = useCallback(async (email: string): Promise<LockoutStatus> => {
    setChecking(true);
    try {
      const { data, error } = await supabase.rpc('check_account_lockout', {
        p_email: email.toLowerCase(),
      });

      if (error) {
        console.error('Error checking lockout:', error);
        // Default to allowing login on error
        return { locked: false, attempts: 0, maxAttempts: 5, remainingAttempts: 5 };
      }

      const status = data as unknown as LockoutStatus;
      setLockoutStatus(status);
      return status;
    } finally {
      setChecking(false);
    }
  }, []);

  const recordAttempt = useCallback(async (email: string, success: boolean): Promise<void> => {
    try {
      await supabase.rpc('record_login_attempt', {
        p_email: email.toLowerCase(),
        p_success: success,
        p_ip_address: null, // Could be enhanced with IP detection
      });

      // If failed, refresh lockout status
      if (!success) {
        await checkLockout(email);
      } else {
        // Reset lockout status on success
        setLockoutStatus(null);
      }
    } catch (error) {
      console.error('Error recording login attempt:', error);
    }
  }, [checkLockout]);

  const formatLockoutTime = useCallback((seconds: number): string => {
    if (seconds <= 0) return 'now';
    const minutes = Math.ceil(seconds / 60);
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  }, []);

  const clearLockoutStatus = useCallback(() => {
    setLockoutStatus(null);
  }, []);

  return {
    lockoutStatus,
    checking,
    checkLockout,
    recordAttempt,
    formatLockoutTime,
    clearLockoutStatus,
  };
}
