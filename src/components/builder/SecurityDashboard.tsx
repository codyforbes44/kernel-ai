import { useState } from 'react';
import { useSecurityScan } from '@/hooks/useSecurityScan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  FileCode,
  Clock,
  Database,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SecurityFinding, SecuritySeverity, TableSecurityStatus } from '@/types/security';

interface SecurityDashboardProps {
  onClose?: () => void;
}

const SEVERITY_CONFIG: Record<SecuritySeverity, { icon: typeof AlertCircle; color: string; bgColor: string }> = {
  critical: { icon: ShieldX, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  high: { icon: ShieldAlert, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  medium: { icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  low: { icon: AlertCircle, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  info: { icon: Info, color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

function SeverityBadge({ severity }: { severity: SecuritySeverity }) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className={cn('gap-1', config.color, config.bgColor)}>
      <Icon className="h-3 w-3" />
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
}

function FindingCard({ finding, isExpanded, onToggle }: { 
  finding: SecurityFinding; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const config = SEVERITY_CONFIG[finding.severity];

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className={cn('transition-colors', config.bgColor, 'border-l-4', 
        finding.severity === 'critical' && 'border-l-red-500',
        finding.severity === 'high' && 'border-l-orange-500',
        finding.severity === 'medium' && 'border-l-yellow-500',
        finding.severity === 'low' && 'border-l-blue-500',
        finding.severity === 'info' && 'border-l-muted-foreground'
      )}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="py-3 px-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge severity={finding.severity} />
                  <Badge variant="secondary" className="text-xs">
                    {finding.tableName}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-medium">{finding.title}</CardTitle>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4 space-y-3">
            <p className="text-sm text-muted-foreground">{finding.description}</p>
            
            {finding.affectedOperations && (
              <div className="flex gap-1.5">
                {finding.affectedOperations.map(op => (
                  <Badge key={op} variant="outline" className="text-xs">
                    {op}
                  </Badge>
                ))}
              </div>
            )}

            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Remediation:</p>
              <code className="text-xs font-mono text-foreground break-all">
                {finding.remediation}
              </code>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function TableStatusCard({ status }: { status: TableSecurityStatus }) {
  const scoreColor = 
    status.securityScore >= 80 ? 'text-green-500' :
    status.securityScore >= 60 ? 'text-yellow-500' :
    status.securityScore >= 40 ? 'text-orange-500' : 'text-red-500';

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{status.tableName}</span>
        </div>
        <span className={cn('text-lg font-bold', scoreColor)}>
          {status.securityScore}
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
        <div className="flex items-center gap-1">
          {status.rlsEnabled ? (
            <Lock className="h-3 w-3 text-green-500" />
          ) : (
            <Unlock className="h-3 w-3 text-red-500" />
          )}
          RLS {status.rlsEnabled ? 'Enabled' : 'Disabled'}
        </div>
        <div>{status.policyCount} policies</div>
      </div>

      <div className="flex gap-2">
        {['SELECT', 'INSERT', 'UPDATE', 'DELETE'].map((op, i) => {
          const hasPolicy = [
            status.hasSelectPolicy,
            status.hasInsertPolicy,
            status.hasUpdatePolicy,
            status.hasDeletePolicy,
          ][i];
          
          return (
            <Badge 
              key={op} 
              variant="outline" 
              className={cn(
                'text-xs gap-1',
                hasPolicy ? 'text-green-500 border-green-500/30' : 'text-muted-foreground'
              )}
            >
              {hasPolicy ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {op.charAt(0)}
            </Badge>
          );
        })}
      </div>

      {status.findings.length > 0 && (
        <div className="mt-2 text-xs text-orange-500">
          {status.findings.length} issue{status.findings.length !== 1 ? 's' : ''} found
        </div>
      )}
    </Card>
  );
}

export function SecurityDashboard({ onClose }: SecurityDashboardProps) {
  const {
    scanResult,
    isScanning,
    lastScannedAt,
    runScan,
    getSecurityGrade,
    downloadReport,
  } = useSecurityScan();

  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'findings' | 'tables'>('findings');

  const toggleFinding = (id: string) => {
    setExpandedFindings(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const grade = getSecurityGrade();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Security Scanner</h2>
              <p className="text-xs text-muted-foreground">
                RLS policies & vulnerability detection
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadReport('json')}
              disabled={!scanResult}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadReport('sql')}
              disabled={!scanResult}
              className="gap-1.5"
            >
              <FileCode className="h-3.5 w-3.5" />
              SQL
            </Button>
            <Button
              size="sm"
              onClick={() => runScan()}
              disabled={isScanning}
              className="gap-1.5"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isScanning && 'animate-spin')} />
              {isScanning ? 'Scanning...' : 'Run Scan'}
            </Button>
          </div>
        </div>

        {/* Last scan info */}
        {lastScannedAt && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last scan: {new Date(lastScannedAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {isScanning ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Analyzing database security...</p>
          </div>
        ) : !scanResult ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center p-4">
            <div className="p-4 rounded-full bg-muted">
              <ShieldCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium mb-1">No Scan Results</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Run a security scan to analyze RLS policies and detect vulnerabilities
              </p>
              <Button onClick={() => runScan()} className="gap-2">
                <Shield className="h-4 w-4" />
                Start Security Scan
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  {grade && (
                    <span className={cn('text-3xl font-bold', grade.color)}>
                      {grade.grade}
                    </span>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {grade?.description}
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Tables Scanned</div>
                  <Badge variant="secondary">{scanResult.summary.totalTables}</Badge>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-green-500">RLS Enabled</span>
                    <span>{scanResult.summary.tablesWithRLS}</span>
                  </div>
                  <Progress 
                    value={(scanResult.summary.tablesWithRLS / scanResult.summary.totalTables) * 100} 
                    className="h-1.5"
                  />
                </div>
              </Card>

              <Card className={cn('p-4', scanResult.summary.critical > 0 && 'border-red-500/50')}>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldX className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-muted-foreground">Critical</span>
                </div>
                <span className="text-2xl font-bold text-red-500">
                  {scanResult.summary.critical}
                </span>
              </Card>

              <Card className={cn('p-4', scanResult.summary.high > 0 && 'border-orange-500/50')}>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">High</span>
                </div>
                <span className="text-2xl font-bold text-orange-500">
                  {scanResult.summary.high}
                </span>
              </Card>
            </div>

            {/* Issue Counts */}
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1.5 text-yellow-500">
                <AlertTriangle className="h-3 w-3" />
                {scanResult.summary.medium} Medium
              </Badge>
              <Badge variant="outline" className="gap-1.5 text-blue-500">
                <AlertCircle className="h-3 w-3" />
                {scanResult.summary.low} Low
              </Badge>
              <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                <Info className="h-3 w-3" />
                {scanResult.summary.info} Info
              </Badge>
            </div>

            {/* Tabs for Findings/Tables */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList>
                <TabsTrigger value="findings" className="gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Findings ({scanResult.findings.length})
                </TabsTrigger>
                <TabsTrigger value="tables" className="gap-1.5">
                  <Database className="h-3.5 w-3.5" />
                  Tables ({scanResult.tableStatuses.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="findings" className="mt-4 space-y-2">
                {scanResult.findings.length === 0 ? (
                  <Card className="p-8 text-center">
                    <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-medium mb-1">All Clear!</h3>
                    <p className="text-sm text-muted-foreground">
                      No security vulnerabilities detected
                    </p>
                  </Card>
                ) : (
                  scanResult.findings
                    .sort((a, b) => {
                      const order = ['critical', 'high', 'medium', 'low', 'info'];
                      return order.indexOf(a.severity) - order.indexOf(b.severity);
                    })
                    .map(finding => (
                      <FindingCard
                        key={finding.id}
                        finding={finding}
                        isExpanded={expandedFindings.has(finding.id)}
                        onToggle={() => toggleFinding(finding.id)}
                      />
                    ))
                )}
              </TabsContent>

              <TabsContent value="tables" className="mt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {scanResult.tableStatuses.map(status => (
                    <TableStatusCard key={status.tableName} status={status} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
