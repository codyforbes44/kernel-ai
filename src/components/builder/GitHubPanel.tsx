import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Github, Link2, Unlink, Upload, Download, Plus, ExternalLink, GitCommit, AlertCircle, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGitHub } from '@/hooks/useGitHub';
import { cn } from '@/lib/utils';
import type { GitHubRepo } from '@/types/github';

interface GitHubPanelProps {
  projectId: string;
  projectName?: string;
}

export function GitHubPanel({ projectId, projectName }: GitHubPanelProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState('');
  const [newRepoName, setNewRepoName] = useState(projectName?.toLowerCase().replace(/\s+/g, '-') || '');
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  
  const {
    isConfigured,
    connection,
    repo,
    commits,
    isLoading,
    connect,
    handleCallback,
    disconnect,
    isDisconnecting,
    listRepos,
    isListingRepos,
    linkRepo,
    isLinkingRepo,
    unlinkRepo,
    isUnlinkingRepo,
    createRepo,
    isCreatingRepo,
    push,
    isPushing,
    pull,
    isPulling,
    isSyncing,
    syncStatus,
    lastSyncedAt,
  } = useGitHub({ projectId });

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const isCallback = searchParams.get('github_callback');

    if (code && state && isCallback) {
      handleCallback(code, state).then(() => {
        // Clean up URL
        searchParams.delete('code');
        searchParams.delete('state');
        searchParams.delete('github_callback');
        setSearchParams(searchParams, { replace: true });
      });
    }
  }, [searchParams, handleCallback, setSearchParams]);

  // Load repos when dialog opens
  const handleOpenLinkDialog = async () => {
    setShowLinkDialog(true);
    try {
      const fetchedRepos = await listRepos();
      setRepos(fetchedRepos);
    } catch {
      // Error handled by hook
    }
  };

  const handleLinkRepo = () => {
    if (!selectedRepo) return;
    const [owner, name] = selectedRepo.split('/');
    const repoData = repos.find(r => r.full_name === selectedRepo);
    linkRepo({
      repoOwner: owner,
      repoName: name,
      defaultBranch: repoData?.default_branch || 'main',
    });
    setShowLinkDialog(false);
    setSelectedRepo('');
  };

  const handleCreateAndLink = async () => {
    if (!newRepoName) return;
    try {
      const createdRepo = await createRepo({
        repoName: newRepoName,
        isPrivate: newRepoPrivate,
        description: `Created from Lovable Builder`,
      });
      linkRepo({
        repoOwner: createdRepo.owner.login,
        repoName: createdRepo.name,
        defaultBranch: createdRepo.default_branch,
      });
      setShowCreateDialog(false);
      setNewRepoName('');
    } catch {
      // Error handled by hook
    }
  };

  const handlePush = () => {
    if (!commitMessage.trim()) return;
    push(commitMessage);
    setCommitMessage('');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Not configured state
  if (isConfigured === false) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <Github className="h-4 w-4" />
          <h3 className="font-semibold text-sm">GitHub</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              GitHub integration is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable this feature.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || isConfigured === null) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <Github className="h-4 w-4" />
          <h3 className="font-semibold text-sm">GitHub</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Not connected state
  if (!connection) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <Github className="h-4 w-4" />
          <h3 className="font-semibold text-sm">GitHub</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          <div className="text-center space-y-2">
            <Github className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Connect your GitHub account to sync your project
            </p>
          </div>
          <Button onClick={connect} className="gap-2">
            <Github className="h-4 w-4" />
            Connect to GitHub
          </Button>
        </div>
      </div>
    );
  }

  // Connected but no repo linked
  if (!repo) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            <h3 className="font-semibold text-sm">GitHub</h3>
          </div>
          <div className="flex items-center gap-2">
            {connection.avatar_url && (
              <img
                src={connection.avatar_url}
                alt={connection.github_username}
                className="h-5 w-5 rounded-full"
              />
            )}
            <span className="text-xs text-muted-foreground">{connection.github_username}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          <div className="text-center space-y-2">
            <Link2 className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Link a repository to sync your code
            </p>
          </div>

          <div className="flex gap-2">
            <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={handleOpenLinkDialog} className="gap-2">
                  <Link2 className="h-4 w-4" />
                  Link Existing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Link Repository</DialogTitle>
                  <DialogDescription>
                    Select a repository to link to this project
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {isListingRepos ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a repository" />
                      </SelectTrigger>
                      <SelectContent>
                        {repos.map((r) => (
                          <SelectItem key={r.id} value={r.full_name}>
                            <div className="flex items-center gap-2">
                              <span>{r.full_name}</span>
                              {r.private && (
                                <Badge variant="secondary" className="text-xs">Private</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleLinkRepo} disabled={!selectedRepo || isLinkingRepo}>
                    {isLinkingRepo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Link Repository
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Repository</DialogTitle>
                  <DialogDescription>
                    Create a new GitHub repository for this project
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="repo-name">Repository Name</Label>
                    <Input
                      id="repo-name"
                      value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value)}
                      placeholder="my-project"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="repo-private"
                      checked={newRepoPrivate}
                      onChange={(e) => setNewRepoPrivate(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="repo-private">Make private</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAndLink} disabled={!newRepoName || isCreatingRepo}>
                    {isCreatingRepo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create & Link
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => disconnect()}
            disabled={isDisconnecting}
            className="w-full text-destructive hover:text-destructive"
          >
            {isDisconnecting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Unlink className="h-4 w-4 mr-2" />
            )}
            Disconnect GitHub
          </Button>
        </div>
      </div>
    );
  }

  // Fully connected with repo
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          <h3 className="font-semibold text-sm">GitHub</h3>
        </div>
        <Badge
          variant={syncStatus === 'error' ? 'destructive' : 'secondary'}
          className={cn(
            'text-xs',
            syncStatus === 'syncing' && 'animate-pulse'
          )}
        >
          {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Error' : 'Connected'}
        </Badge>
      </div>

      {/* Repo Info */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          <a
            href={`https://github.com/${repo.repo_full_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium hover:underline"
          >
            {repo.repo_full_name}
            <ExternalLink className="h-3 w-3" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => unlinkRepo()}
            disabled={isUnlinkingRepo}
            className="h-6 w-6"
          >
            {isUnlinkingRepo ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Branch: {repo.default_branch}</span>
          {lastSyncedAt && (
            <span>Last sync: {formatDate(lastSyncedAt.toISOString())}</span>
          )}
        </div>
      </div>

      {/* Sync Controls */}
      <div className="p-3 space-y-3 border-b border-border">
        <div className="space-y-2">
          <Label htmlFor="commit-message" className="text-xs">Commit Message</Label>
          <Input
            id="commit-message"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Update from Lovable Builder"
            className="h-8 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handlePush}
            disabled={isSyncing || !commitMessage.trim()}
            className="flex-1 gap-2"
            size="sm"
          >
            {isPushing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Push
          </Button>
          <Button
            onClick={() => pull()}
            disabled={isSyncing}
            variant="outline"
            className="flex-1 gap-2"
            size="sm"
          >
            {isPulling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Pull
          </Button>
        </div>
      </div>

      {/* Commit History */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-3 pb-2">
          <h4 className="text-xs font-medium text-muted-foreground">Commit History</h4>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-3 pb-3 space-y-2">
            {commits.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No commits yet
              </p>
            ) : (
              commits.map((commit) => (
                <div
                  key={commit.id}
                  className="flex items-start gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={cn(
                    'mt-0.5 p-1 rounded',
                    commit.direction === 'push' ? 'bg-primary/10' : 'bg-secondary'
                  )}>
                    {commit.direction === 'push' ? (
                      <Upload className="h-3 w-3" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {commit.commit_message || 'No message'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <code className="font-mono">{commit.commit_sha.slice(0, 7)}</code>
                      <span>•</span>
                      <span>{formatDate(commit.synced_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <Separator />
      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => disconnect()}
          disabled={isDisconnecting}
          className="w-full text-destructive hover:text-destructive"
        >
          {isDisconnecting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Unlink className="h-4 w-4 mr-2" />
          )}
          Disconnect GitHub
        </Button>
      </div>
    </div>
  );
}
