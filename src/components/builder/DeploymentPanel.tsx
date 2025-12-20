import { useState, useEffect } from 'react';
import { 
  Rocket, 
  Globe, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ChevronDown,
  ChevronUp,
  History,
  FileCode,
  Zap,
  RotateCcw,
  Radio,
  Terminal,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useDeployments, type Deployment, type CustomDomain } from '@/hooks/useDeployments';
import { BuildLogViewer } from './BuildLogViewer';
import { DeploymentPreview } from './DeploymentPreview';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface DeploymentPanelProps {
  projectId: string;
  onClose?: () => void;
}

export function DeploymentPanel({ projectId, onClose }: DeploymentPanelProps) {
  const {
    deployments,
    latestPreview,
    latestProduction,
    customDomains,
    activeBuilds,
    isLoading,
    deploy,
    isDeploying,
    rollback,
    isRollingBack,
    addDomain,
    deleteDomain,
    verifyDomain,
    isVerifyingDomain,
  } = useDeployments(projectId);

  const [showHistory, setShowHistory] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [showDomainForm, setShowDomainForm] = useState(false);
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});
  const [viewingLogId, setViewingLogId] = useState<string | null>(null);
  const [expandedDomainId, setExpandedDomainId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update elapsed time every second for active builds
  useEffect(() => {
    if (activeBuilds.length === 0) {
      setElapsedTimes({});
      return;
    }

    const interval = setInterval(() => {
      const times: Record<string, number> = {};
      activeBuilds.forEach((build) => {
        const startTime = build.startedAt ? new Date(build.startedAt).getTime() : new Date(build.createdAt).getTime();
        times[build.id] = Math.floor((Date.now() - startTime) / 1000);
      });
      setElapsedTimes(times);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBuilds]);

  const formatElapsedTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleDeploy = async (environment: 'preview' | 'production') => {
    await deploy({ environment });
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    await addDomain(newDomain);
    setNewDomain('');
    setShowDomainForm(false);
  };

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'building':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Deployment['status']) => {
    const variants: Record<Deployment['status'], string> = {
      deployed: 'bg-success/20 text-success',
      building: 'bg-primary/20 text-primary',
      failed: 'bg-destructive/20 text-destructive',
      pending: 'bg-muted text-muted-foreground',
    };
    return variants[status] || variants.pending;
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background border-l border-border">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="h-10 flex items-center gap-2 px-3 border-b border-border bg-muted/30">
        <Rocket className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Deployments</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Quick Deploy Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Deploy
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => handleDeploy('preview')}
                disabled={isDeploying}
              >
                {isDeploying ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Globe className="h-5 w-5 text-primary" />
                )}
                <span className="text-xs">Preview</span>
              </Button>
              
              <Button
                className="h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => handleDeploy('production')}
                disabled={isDeploying}
              >
                {isDeploying ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Rocket className="h-5 w-5" />
                )}
                <span className="text-xs">Production</span>
              </Button>
            </div>
          </div>

          {/* Active Builds Section */}
          {activeBuilds.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Radio className="h-4 w-4 text-primary animate-pulse" />
                  Active Builds
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {activeBuilds.length} running
                  </Badge>
                </h3>
                
                <div className="space-y-3">
                  {activeBuilds.map((build) => (
                    <div key={build.id} className="space-y-2">
                      <div 
                        className="relative overflow-hidden bg-primary/5 border border-primary/20 rounded-lg p-3 cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => setViewingLogId(viewingLogId === build.id ? null : build.id)}
                      >
                        {/* Animated progress bar */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 animate-pulse" />
                        
                        <div className="relative space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              <span className="text-sm font-medium">
                                v{build.version}
                              </span>
                              <Badge 
                                variant="outline" 
                                className="text-[10px] px-1.5 border-primary/30"
                              >
                                {build.environment}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingLogId(viewingLogId === build.id ? null : build.id);
                                }}
                              >
                                <Terminal className="h-3 w-3 mr-1" />
                                Logs
                              </Button>
                              <Badge 
                                className={cn(
                                  "text-[10px]",
                                  getStatusBadge(build.status)
                                )}
                              >
                                {build.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {elapsedTimes[build.id] !== undefined 
                                ? formatElapsedTime(elapsedTimes[build.id])
                                : 'Starting...'}
                            </span>
                            {build.fileCount > 0 && (
                              <span className="flex items-center gap-1">
                                <FileCode className="h-3 w-3" />
                                {build.fileCount} files
                              </span>
                            )}
                            {build.commitMessage && (
                              <span className="truncate max-w-[120px]" title={build.commitMessage}>
                                {build.commitMessage}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Build Log Viewer */}
                      {viewingLogId === build.id && (
                        <BuildLogViewer
                          deploymentId={build.id}
                          initialLog={build.buildLog}
                          onClose={() => setViewingLogId(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Current Deployments */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Live Deployments</h3>
            
            {/* Preview */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">PREVIEW</span>
                <div className="flex items-center gap-1">
                  {latestPreview?.deployUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => setPreviewUrl(latestPreview.deployUrl)}
                      title="Preview in panel"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  {latestPreview && getStatusIcon(latestPreview.status)}
                </div>
              </div>
              {latestPreview?.deployUrl ? (
                <a
                  href={latestPreview.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
                >
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{latestPreview.subdomain || 'View'}</span>
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">Not deployed</span>
              )}
              {latestPreview && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>v{latestPreview.version}</span>
                  <span>•</span>
                  <span>{formatBytes(latestPreview.bundleSizeBytes)}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(latestPreview.createdAt), { addSuffix: true })}</span>
                </div>
              )}
            </div>

            {/* Production */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-primary">PRODUCTION</span>
                <div className="flex items-center gap-1">
                  {latestProduction?.deployUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => setPreviewUrl(latestProduction.deployUrl)}
                      title="Preview in panel"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  {latestProduction && getStatusIcon(latestProduction.status)}
                </div>
              </div>
              {latestProduction?.deployUrl ? (
                <a
                  href={latestProduction.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
                >
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{latestProduction.subdomain || 'View'}</span>
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">Not deployed</span>
              )}
              {latestProduction && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>v{latestProduction.version}</span>
                  <span>•</span>
                  <span>{formatBytes(latestProduction.bundleSizeBytes)}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(latestProduction.createdAt), { addSuffix: true })}</span>
                </div>
              )}
            </div>

            {/* Deployment Preview */}
            {previewUrl && (
              <DeploymentPreview
                url={previewUrl}
                title={previewUrl.includes('preview') ? 'Preview' : 'Production'}
                onClose={() => setPreviewUrl(null)}
              />
            )}
          </div>

          <Separator />

          {/* Custom Domains */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Custom Domains</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowDomainForm(!showDomainForm)}
              >
                {showDomainForm ? 'Cancel' : '+ Add'}
              </Button>
            </div>

            {showDomainForm && (
              <div className="flex gap-2">
                <Input
                  placeholder="yourdomain.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button size="sm" className="h-8" onClick={handleAddDomain}>
                  Add
                </Button>
              </div>
            )}

            {customDomains.length > 0 ? (
              <div className="space-y-2">
                {customDomains.map((domain) => (
                  <div key={domain.id} className="space-y-2">
                    <div
                      className={cn(
                        "p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted/70 transition-colors",
                        expandedDomainId === domain.id && "bg-muted/70"
                      )}
                      onClick={() => setExpandedDomainId(expandedDomainId === domain.id ? null : domain.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{domain.domain}</span>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-[10px] px-1.5",
                              domain.status === 'active' && "bg-success/20 text-success",
                              domain.status === 'verifying' && "bg-primary/20 text-primary animate-pulse",
                              domain.status === 'failed' && "bg-destructive/20 text-destructive",
                              domain.status === 'pending' && "bg-muted text-muted-foreground"
                            )}
                          >
                            {domain.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {domain.status !== 'active' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                verifyDomain(domain.id);
                              }}
                              disabled={isVerifyingDomain}
                              title="Verify DNS"
                            >
                              {isVerifyingDomain ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDomain(domain.id);
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* DNS Setup Instructions */}
                    {expandedDomainId === domain.id && domain.status !== 'active' && (
                      <div className="p-3 bg-muted/30 rounded-md border border-border space-y-3">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <AlertCircle className="h-3.5 w-3.5 text-primary" />
                          DNS Configuration Required
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Add these records at your domain registrar:
                        </p>
                        
                        {/* TXT Record */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-muted-foreground">TXT RECORD</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => {
                                navigator.clipboard.writeText(`lovable_verify=${domain.verificationToken}`);
                                setCopiedField(`txt-${domain.id}`);
                                setTimeout(() => setCopiedField(null), 2000);
                              }}
                            >
                              {copiedField === `txt-${domain.id}` ? (
                                <Check className="h-3 w-3 text-success" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <div className="bg-background rounded p-2 font-mono text-xs space-y-1">
                            <div><span className="text-muted-foreground">Name:</span> _lovable</div>
                            <div><span className="text-muted-foreground">Value:</span> lovable_verify={domain.verificationToken}</div>
                          </div>
                        </div>
                        
                        {/* A Record */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-muted-foreground">A RECORD</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => {
                                navigator.clipboard.writeText('185.158.133.1');
                                setCopiedField(`a-${domain.id}`);
                                setTimeout(() => setCopiedField(null), 2000);
                              }}
                            >
                              {copiedField === `a-${domain.id}` ? (
                                <Check className="h-3 w-3 text-success" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <div className="bg-background rounded p-2 font-mono text-xs space-y-1">
                            <div><span className="text-muted-foreground">Name:</span> @ (or {domain.domain})</div>
                            <div><span className="text-muted-foreground">Value:</span> 185.158.133.1</div>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          className="w-full h-7 text-xs"
                          onClick={() => verifyDomain(domain.id)}
                          disabled={isVerifyingDomain}
                        >
                          {isVerifyingDomain ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Verify DNS Records
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {/* Active Domain Success State */}
                    {expandedDomainId === domain.id && domain.status === 'active' && (
                      <div className="p-3 bg-success/10 rounded-md border border-success/20 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-success">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Domain Verified & Active
                        </div>
                        <a
                          href={`https://${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Visit {domain.domain}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No custom domains configured
              </p>
            )}
          </div>

          <Separator />

          {/* Deployment History */}
          <div className="space-y-3">
            <button
              className="w-full flex items-center justify-between text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setShowHistory(!showHistory)}
            >
              <span className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Deployment History
              </span>
              {showHistory ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showHistory && (
              <div className="space-y-2">
                {deployments.length > 0 ? (
                  deployments.slice(0, 10).map((deployment) => (
                    <div
                      key={deployment.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded-md text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(deployment.status)}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">v{deployment.version}</span>
                            <Badge 
                              variant="outline" 
                              className="text-[10px] px-1 py-0"
                            >
                              {deployment.environment}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground">
                            {formatDistanceToNow(new Date(deployment.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground mr-1">
                          {deployment.buildDurationMs ? `${deployment.buildDurationMs}ms` : '-'}
                        </span>
                        {deployment.status === 'deployed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => rollback(deployment.id)}
                            disabled={isRollingBack || isDeploying}
                            title="Rollback to this version"
                          >
                            {isRollingBack ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        {deployment.deployUrl && (
                          <a
                            href={deployment.deployUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 p-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No deployments yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
