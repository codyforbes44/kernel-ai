import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityService } from '@/services/securityService';
import type { SecurityScanResult, SecurityFinding, SecuritySeverity } from '@/types/security';
import { toast } from 'sonner';

export function useSecurityScan() {
  const queryClient = useQueryClient();
  const [lastScannedAt, setLastScannedAt] = useState<string | null>(null);

  // Try to load cached result on mount
  useEffect(() => {
    const cached = securityService.getCachedScan();
    if (cached) {
      setLastScannedAt(cached.scannedAt);
    }
  }, []);

  // Query for cached results
  const {
    data: scanResult,
    isLoading: isLoadingCached,
  } = useQuery({
    queryKey: ['security-scan-cached'],
    queryFn: () => {
      const cached = securityService.getCachedScan();
      return cached || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for running a new scan
  const {
    mutateAsync: runScan,
    isPending: isScanning,
  } = useMutation({
    mutationFn: securityService.runScan,
    onSuccess: (result) => {
      setLastScannedAt(result.scannedAt);
      queryClient.setQueryData(['security-scan-cached'], result);
      toast.success('Security scan complete', {
        description: `Found ${result.findings.length} issues across ${result.summary.tablesWithIssues} tables`,
      });
    },
    onError: (error) => {
      toast.error('Security scan failed', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });

  // Get severity counts
  const getSeverityCount = useCallback((severity: SecuritySeverity): number => {
    if (!scanResult) return 0;
    return scanResult.findings.filter(f => f.severity === severity).length;
  }, [scanResult]);

  // Get findings for a specific table
  const getTableFindings = useCallback((tableName: string): SecurityFinding[] => {
    if (!scanResult) return [];
    return scanResult.findings.filter(f => f.tableName === tableName);
  }, [scanResult]);

  // Get table security status
  const getTableStatus = useCallback((tableName: string) => {
    if (!scanResult) return null;
    return scanResult.tableStatuses.find(s => s.tableName === tableName);
  }, [scanResult]);

  // Get security grade
  const getSecurityGrade = useCallback(() => {
    if (!scanResult) return null;
    return securityService.getSecurityGrade(scanResult);
  }, [scanResult]);

  // Download report
  const downloadReport = useCallback((format: 'json' | 'sql' = 'json') => {
    if (!scanResult) {
      toast.error('No scan results to download');
      return;
    }
    securityService.downloadReport(scanResult, format);
    toast.success(`Downloaded ${format.toUpperCase()} report`);
  }, [scanResult]);

  // Clear cache and results
  const clearResults = useCallback(() => {
    securityService.clearCache();
    queryClient.setQueryData(['security-scan-cached'], null);
    setLastScannedAt(null);
  }, [queryClient]);

  return {
    scanResult,
    isScanning,
    isLoadingCached,
    lastScannedAt,
    runScan,
    getSeverityCount,
    getTableFindings,
    getTableStatus,
    getSecurityGrade,
    downloadReport,
    clearResults,
    hasCriticalIssues: (scanResult?.summary.critical || 0) > 0,
    hasHighIssues: (scanResult?.summary.high || 0) > 0,
    totalFindings: scanResult?.findings.length || 0,
  };
}
