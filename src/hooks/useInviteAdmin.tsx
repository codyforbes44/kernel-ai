import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InviteCode {
  id: string;
  code: string;
  type: 'single_use' | 'multi_use' | 'unlimited';
  max_uses: number;
  times_used: number;
  created_by: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  campaign: string | null;
  notes: string | null;
}

interface InviteRequest {
  id: string;
  email: string;
  name: string;
  use_case: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  invite_code_id: string | null;
  admin_notes: string | null;
}

interface InviteStats {
  total_codes: number;
  active_codes: number;
  total_redemptions: number;
  pending_requests: number;
  approved_requests: number;
}

interface GenerateParams {
  count?: number;
  type?: 'single_use' | 'multi_use' | 'unlimited';
  max_uses?: number;
  campaign?: string;
  expires_at?: string;
  prefix?: string;
  [key: string]: unknown;
}

export function useInviteAdmin() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [requests, setRequests] = useState<InviteRequest[]>([]);
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [loading, setLoading] = useState(false);

  const callManageEndpoint = useCallback(async (action: string, params: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke('manage-invite-codes', {
      body: { action, ...params }
    });

    if (error) {
      console.error(`Error in ${action}:`, error);
      throw error;
    }

    return data;
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await callManageEndpoint('get_stats');
      setStats(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      return null;
    }
  }, [callManageEndpoint]);

  const fetchCodes = useCallback(async (params?: { status?: string; campaign?: string; limit?: number; offset?: number }) => {
    setLoading(true);
    try {
      const data = await callManageEndpoint('list', params);
      setCodes(data.codes || []);
      return data.codes;
    } catch (err) {
      console.error('Failed to fetch codes:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [callManageEndpoint]);

  const fetchRequests = useCallback(async (params?: { status?: string; limit?: number; offset?: number }) => {
    setLoading(true);
    try {
      const data = await callManageEndpoint('list_requests', params);
      setRequests(data.requests || []);
      return data.requests;
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [callManageEndpoint]);

  const generateCodes = useCallback(async (params: GenerateParams) => {
    setLoading(true);
    try {
      const data = await callManageEndpoint('generate', params);
      // Refresh the codes list
      await fetchCodes();
      await fetchStats();
      return data.codes;
    } catch (err) {
      console.error('Failed to generate codes:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callManageEndpoint, fetchCodes, fetchStats]);

  const deactivateCode = useCallback(async (codeId: string) => {
    try {
      await callManageEndpoint('deactivate', { code_id: codeId });
      // Update local state
      setCodes(prev => prev.map(c => c.id === codeId ? { ...c, is_active: false } : c));
      await fetchStats();
      return true;
    } catch (err) {
      console.error('Failed to deactivate code:', err);
      return false;
    }
  }, [callManageEndpoint, fetchStats]);

  const activateCode = useCallback(async (codeId: string) => {
    try {
      await callManageEndpoint('activate', { code_id: codeId });
      // Update local state
      setCodes(prev => prev.map(c => c.id === codeId ? { ...c, is_active: true } : c));
      await fetchStats();
      return true;
    } catch (err) {
      console.error('Failed to activate code:', err);
      return false;
    }
  }, [callManageEndpoint, fetchStats]);

  const approveRequest = useCallback(async (requestId: string, adminNotes?: string) => {
    try {
      const data = await callManageEndpoint('approve_request', { 
        request_id: requestId, 
        admin_notes: adminNotes 
      });
      // Update local state
      setRequests(prev => prev.filter(r => r.id !== requestId));
      await fetchStats();
      return data;
    } catch (err) {
      console.error('Failed to approve request:', err);
      throw err;
    }
  }, [callManageEndpoint, fetchStats]);

  const rejectRequest = useCallback(async (requestId: string, adminNotes?: string) => {
    try {
      await callManageEndpoint('reject_request', { 
        request_id: requestId, 
        admin_notes: adminNotes 
      });
      // Update local state
      setRequests(prev => prev.filter(r => r.id !== requestId));
      await fetchStats();
      return true;
    } catch (err) {
      console.error('Failed to reject request:', err);
      return false;
    }
  }, [callManageEndpoint, fetchStats]);

  return {
    codes,
    requests,
    stats,
    loading,
    fetchStats,
    fetchCodes,
    fetchRequests,
    generateCodes,
    deactivateCode,
    activateCode,
    approveRequest,
    rejectRequest
  };
}