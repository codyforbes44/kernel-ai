import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInviteAdmin } from '@/hooks/useInviteAdmin';
import { RefreshButton } from './RefreshButton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Copy, Plus, Check, X, Ticket, Users, TrendingUp, Clock } from 'lucide-react';

export function InviteCodeManagementPanel() {
  const { 
    codes, 
    stats, 
    loading, 
    fetchCodes, 
    fetchStats, 
    generateCodes, 
    deactivateCode, 
    activateCode 
  } = useInviteAdmin();
  
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(1);
  const [generateType, setGenerateType] = useState<'single_use' | 'multi_use' | 'unlimited'>('single_use');
  const [generateCampaign, setGenerateCampaign] = useState('');
  const [generateMaxUses, setGenerateMaxUses] = useState(10);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchCodes();
  }, [fetchStats, fetchCodes]);

  const handleRefresh = () => {
    fetchStats();
    fetchCodes({ status: filterStatus === 'all' ? undefined : filterStatus });
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    fetchCodes({ status: status === 'all' ? undefined : status });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newCodes = await generateCodes({
        count: generateCount,
        type: generateType,
        max_uses: generateMaxUses,
        campaign: generateCampaign || undefined
      });
      
      toast.success(`Generated ${newCodes.length} invite code${newCodes.length > 1 ? 's' : ''}`);
      setGenerateDialogOpen(false);
      setGenerateCount(1);
      setGenerateCampaign('');
    } catch (err) {
      toast.error('Failed to generate codes');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = async (codeId: string, isActive: boolean) => {
    const success = isActive 
      ? await deactivateCode(codeId)
      : await activateCode(codeId);
    
    if (success) {
      toast.success(isActive ? 'Code deactivated' : 'Code activated');
    } else {
      toast.error('Failed to update code status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_codes ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_codes ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_redemptions ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_requests ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invite Codes</CardTitle>
              <CardDescription>Generate and manage invite codes for exclusive access</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <RefreshButton onClick={handleRefresh} loading={loading} />
              <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Codes
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Invite Codes</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Number of Codes</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={generateCount}
                        onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={generateType} onValueChange={(v) => setGenerateType(v as typeof generateType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single_use">Single Use</SelectItem>
                          <SelectItem value="multi_use">Multi Use</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {generateType === 'multi_use' && (
                      <div className="space-y-2">
                        <Label>Max Uses</Label>
                        <Input
                          type="number"
                          min={1}
                          value={generateMaxUses}
                          onChange={(e) => setGenerateMaxUses(parseInt(e.target.value) || 10)}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Campaign (optional)</Label>
                      <Input
                        placeholder="e.g., X Launch, Discord Giveaway"
                        value={generateCampaign}
                        onChange={(e) => setGenerateCampaign(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleGenerate}
                      disabled={generating}
                    >
                      {generating ? <LoadingSpinner className="mr-2" /> : null}
                      Generate {generateCount} Code{generateCount > 1 ? 's' : ''}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Label>Filter:</Label>
            <Select value={filterStatus} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No invite codes found. Generate some to get started!
                      </TableCell>
                    </TableRow>
                  ) : (
                    codes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {code.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyCode(code.code)}
                            >
                              {copiedCode === code.code ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {code.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {code.type === 'unlimited' ? (
                            <span className="text-muted-foreground">∞</span>
                          ) : (
                            `${code.times_used} / ${code.max_uses}`
                          )}
                        </TableCell>
                        <TableCell>
                          {code.campaign ? (
                            <Badge variant="secondary">{code.campaign}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(code.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={code.is_active ? 'default' : 'destructive'}>
                            {code.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(code.id, code.is_active)}
                          >
                            {code.is_active ? (
                              <X className="h-4 w-4 text-destructive" />
                            ) : (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}