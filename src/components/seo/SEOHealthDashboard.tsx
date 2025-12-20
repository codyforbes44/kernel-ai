import { useState } from "react";
import { routes, RouteConfig } from "@/lib/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  Globe, 
  Bot, 
  FileText, 
  Shield, 
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  GitCompare,
  Copy,
  Check,
  X
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSitemapDiff } from "@/hooks/useSitemapDiff";
import { SitemapDiffViewer } from "./SitemapDiffViewer";
import { generateSitemapXml } from "@/lib/sitemap";
import { toast } from "@/hooks/use-toast";

const SITE_URL = "https://kernel.cool";

interface RouteStatusProps {
  route: RouteConfig;
}

function RouteStatus({ route }: RouteStatusProps) {
  const isInSitemap = route.includeInSitemap && !route.isDynamic;
  const isBlocked = route.robots === 'disallow';
  
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <code className="text-sm font-mono text-foreground/80">{route.path}</code>
        <span className="text-xs text-muted-foreground hidden sm:inline">{route.title}</span>
      </div>
      <div className="flex items-center gap-2">
        {isInSitemap ? (
          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
            <Globe className="w-3 h-3 mr-1" />
            Sitemap
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border">
            <XCircle className="w-3 h-3 mr-1" />
            Hidden
          </Badge>
        )}
        {isBlocked ? (
          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/30">
            <Shield className="w-3 h-3 mr-1" />
            Blocked
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs bg-sky-500/10 text-sky-500 border-sky-500/30">
            <Bot className="w-3 h-3 mr-1" />
            Crawlable
          </Badge>
        )}
        {route.requiresAuth && (
          <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-500 border-violet-500/30">
            Auth
          </Badge>
        )}
      </div>
    </div>
  );
}

export function SEOHealthDashboard() {
  const [diffDialogOpen, setDiffDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { diff, isLoading, error, compareSitemap, clearDiff } = useSitemapDiff();
  
  const sitemapRoutes = routes.filter(r => r.includeInSitemap && !r.isDynamic);
  const blockedRoutes = routes.filter(r => r.robots === 'disallow');
  const publicRoutes = routes.filter(r => !r.requiresAuth);
  const protectedRoutes = routes.filter(r => r.requiresAuth);
  
  const sitemapCoverage = Math.round((sitemapRoutes.length / publicRoutes.length) * 100);
  const securityScore = Math.round((blockedRoutes.length / protectedRoutes.length) * 100);
  
  const today = new Date().toISOString().split('T')[0];
  
  const handleCompare = async () => {
    await compareSitemap();
    setDiffDialogOpen(true);
  };
  
  const handleCopyGenerated = async () => {
    const generated = generateSitemapXml();
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The generated sitemap XML has been copied.",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleCloseDialog = () => {
    setDiffDialogOpen(false);
    clearDiff();
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SEO Health Dashboard</h2>
          <p className="text-muted-foreground">Monitor sitemap coverage and robots.txt rules</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompare}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <GitCompare className="w-4 h-4" />
            )}
            Check for Changes
          </Button>
          <Badge variant="secondary" className="text-xs">
            <FileText className="w-3 h-3 mr-1" />
            Last updated: {today}
          </Badge>
        </div>
      </div>
      
      {/* Diff Dialog */}
      <Dialog open={diffDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="w-5 h-5" />
              Sitemap Comparison
            </DialogTitle>
            <DialogDescription>
              Comparing current sitemap.xml with generated version from routes configuration
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          {diff && (
            <div className="space-y-4">
              {diff.hasChanges ? (
                <>
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Changes detected</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyGenerated}
                        className="gap-2"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        Copy Generated XML
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      The current sitemap.xml differs from what would be generated. Run <code className="text-xs bg-muted px-1 py-0.5 rounded">npm run build</code> to regenerate.
                    </p>
                  </div>
                  <SitemapDiffViewer 
                    lines={diff.lines} 
                    addedCount={diff.addedCount} 
                    removedCount={diff.removedCount} 
                  />
                </>
              ) : (
                <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">Sitemap is up to date</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No changes needed. The current sitemap matches the routes configuration.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
            <p className="text-xs text-muted-foreground">
              {publicRoutes.length} public, {protectedRoutes.length} protected
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sitemap URLs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sitemapRoutes.length}</div>
            <p className="text-xs text-muted-foreground">
              {sitemapCoverage}% public route coverage
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Routes</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedRoutes.length}</div>
            <p className="text-xs text-muted-foreground">
              In robots.txt Disallow
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityScore}%</div>
            <Progress value={securityScore} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sitemap Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Sitemap.xml
                </CardTitle>
                <CardDescription>Routes included in search engine sitemap</CardDescription>
              </div>
              <a 
                href="/sitemap.xml" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View file <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-2">
                {sitemapRoutes.map((route) => (
                  <div key={route.path} className="flex items-center justify-between py-2 px-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <code className="text-sm font-mono">
                        {route.path === '/' ? SITE_URL : `${SITE_URL}${route.path}`}
                      </code>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{route.changefreq}</span>
                      <Separator orientation="vertical" className="h-3" />
                      <span>p:{route.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Robots.txt Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Robots.txt
                </CardTitle>
                <CardDescription>Crawler access rules and restrictions</CardDescription>
              </div>
              <a 
                href="/robots.txt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View file <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="text-xs font-medium text-muted-foreground mb-2">User-agent: *</div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Allow: /</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    Disallowed Paths
                  </div>
                  <div className="space-y-2">
                    {blockedRoutes.map((route) => (
                      <div key={route.path} className="flex items-center gap-2 py-2 px-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <XCircle className="w-4 h-4 text-amber-500" />
                        <code className="text-sm font-mono">Disallow: {route.path}</code>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <XCircle className="w-4 h-4 text-amber-500" />
                      <code className="text-sm font-mono">Disallow: /api/</code>
                    </div>
                    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <XCircle className="w-4 h-4 text-amber-500" />
                      <code className="text-sm font-mono">Disallow: /_/</code>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/10">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Sitemap</div>
                  <code className="text-sm font-mono text-sky-500">{SITE_URL}/sitemap.xml</code>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* All Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
          <CardDescription>Complete route configuration with SEO status</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {routes.map((route) => (
                <RouteStatus key={route.path} route={route} />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
