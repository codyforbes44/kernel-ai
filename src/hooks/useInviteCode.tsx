import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  valid: boolean;
  error?: string;
  code_id?: string;
  type?: string;
  remaining_uses?: number;
  campaign?: string;
}

interface RedemptionResult {
  valid: boolean;
  redeemed?: boolean;
  error?: string;
  message?: string;
}

interface InviteRequest {
  email: string;
  name: string;
  use_case: string;
}

interface RequestResult {
  success?: boolean;
  error?: string;
  message?: string;
}

export function useInviteCode() {
  const [validating, setValidating] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validateCode = useCallback(async (code: string): Promise<ValidationResult> => {
    setValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-invite-code', {
        body: { code }
      });

      if (error) {
        console.error('Error validating code:', error);
        return { valid: false, error: 'Failed to validate code' };
      }

      return data;
    } catch (err) {
      console.error('Validation error:', err);
      return { valid: false, error: 'Failed to validate code' };
    } finally {
      setValidating(false);
    }
  }, []);

  const redeemCode = useCallback(async (code: string): Promise<RedemptionResult> => {
    setRedeeming(true);
    try {
      const { data, error } = await supabase.functions.invoke('redeem-invite-code', {
        body: { code }
      });

      if (error) {
        console.error('Error redeeming code:', error);
        return { valid: false, error: 'Failed to redeem code' };
      }

      return data;
    } catch (err) {
      console.error('Redemption error:', err);
      return { valid: false, error: 'Failed to redeem code' };
    } finally {
      setRedeeming(false);
    }
  }, []);

  const submitRequest = useCallback(async (request: InviteRequest): Promise<RequestResult> => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-invite-request', {
        body: request
      });

      if (error) {
        console.error('Error submitting request:', error);
        return { error: 'Failed to submit request' };
      }

      return data;
    } catch (err) {
      console.error('Submission error:', err);
      return { error: 'Failed to submit request' };
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    validateCode,
    redeemCode,
    submitRequest,
    validating,
    redeeming,
    submitting
  };
}