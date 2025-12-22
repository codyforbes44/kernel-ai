import { useSecurityScan } from '@/hooks/useSecurityScan';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  RefreshCw,
  Clock,
  ChevronRight,
  Lock,
  Unlock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityPanelProps {
  onOpenDashboard?: () => void;
}

export function SecurityPanel({ onOpenDashboard }: SecurityPanelProps) {
  const {
    scanResult,
    isScanning,
    lastScannedAt,
    runScan,
    getSecurityGrade,
    hasCriticalIssues,
    hasHighIssues,
    totalFindings,
  } = useSecurityScan();

  const grade = getSecurityGrade();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Security</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => runScan()}
            disabled={isScanning}
            className="gap-1.5"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isScanning && 'animate-spin')} />
            Scan
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isScanning ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <LoadingSpinner size="md" />
              <p className="text-sm text-muted-foreground">Scanning...</p>
            </div>
          ) : !scanResult ? (
            <Card className="p-6 text-center">
              <ShieldCheck className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                No scan results yet
              </p>
              <Button size="sm" onClick={() => runScan()} className="gap-2">
                <Shield className="h-4 w-4" />
                Run Security Scan
              </Button>
            </Card>
          ) : (
            <>
              {/* Security Grade */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Security Grade</p>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-3xl font-bold', grade?.color)}>
                        {grade?.grade}
                      </span>
                      <span className="text-xs text-muted-foreground max-w-[120px]">
                        {grade?.description}
                      </span>
                    </div>
                  </div>
                  {hasCriticalIssues ? (
                    <ShieldX className="h-8 w-8 text-red-500" />
                  ) : hasHighIssues ? (
                    <ShieldAlert className="h-8 w-8 text-orange-500" />
                  ) : totalFindings > 0 ? (
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  ) : (
                    <ShieldCheck className="h-8 w-8 text-green-500" />
                  )}
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2">
                <Card className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs text-muted-foreground">RLS Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      {scanResult.summary.tablesWithRLS}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {scanResult.summary.totalTables}
                    </span>
                  </div>
                  <Progress 
                    value={(scanResult.summary.tablesWithRLS / scanResult.summary.totalTables) * 100}
                    className="h-1 mt-2"
                  />
                </Card>

                <Card className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Unlock className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs text-muted-foreground">Unprotected</span>
                  </div>
                  <span className="text-lg font-bold text-red-500">
                    {scanResult.summary.tablesWithoutRLS}
                  </span>
                </Card>
              </div>

              {/* Issue Summary */}
              <Card className="p-3">
                <p className="text-xs text-muted-foreground mb-2">Issues Found</p>
                <div className="flex gap-2 flex-wrap">
                  {scanResult.summary.critical > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <ShieldX className="h-3 w-3" />
                      {scanResult.summary.critical} Critical
                    </Badge>
                  )}
                  {scanResult.summary.high > 0 && (
                    <Badge className="gap-1 bg-orange-500 hover:bg-orange-600">
                      <ShieldAlert className="h-3 w-3" />
                      {scanResult.summary.high} High
                    </Badge>
                  )}
                  {scanResult.summary.medium > 0 && (
                    <Badge variant="secondary" className="gap-1 text-yellow-600">
                      {scanResult.summary.medium} Medium
                    </Badge>
                  )}
                  {scanResult.summary.low > 0 && (
                    <Badge variant="outline" className="gap-1">
                      {scanResult.summary.low} Low
                    </Badge>
                  )}
                  {totalFindings === 0 && (
                    <Badge variant="outline" className="gap-1 text-green-500 border-green-500/30">
                      <ShieldCheck className="h-3 w-3" />
                      All Clear
                    </Badge>
                  )}
                </div>
              </Card>

              {/* Top Issues Preview */}
              {scanResult.findings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Top Issues</p>
                  {scanResult.findings
                    .filter(f => f.severity === 'critical' || f.severity === 'high')
                    .slice(0, 3)
                    .map(finding => (
                      <Card 
                        key={finding.id} 
                        className={cn(
                          'p-3 border-l-2',
                          finding.severity === 'critical' && 'border-l-red-500',
                          finding.severity === 'high' && 'border-l-orange-500'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {finding.severity === 'critical' ? (
                            <ShieldX className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <ShieldAlert className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{finding.title}</p>
                            <p className="text-xs text-muted-foreground">{finding.tableName}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              )}

              {/* View Full Dashboard */}
              {onOpenDashboard && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={onOpenDashboard}
                >
                  View Full Dashboard
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {/* Last Scan Time */}
              {lastScannedAt && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(lastScannedAt).toLocaleTimeString()}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
