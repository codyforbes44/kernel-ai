import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useInviteAdmin } from '@/hooks/useInviteAdmin';
import { RefreshButton } from './RefreshButton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Check, X, Eye, Copy, Mail, User } from 'lucide-react';

export function InviteRequestsPanel() {
  const { 
    requests, 
    loading, 
    fetchRequests, 
    approveRequest, 
    rejectRequest 
  } = useInviteAdmin();
  
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<typeof requests[0] | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [approvedCode, setApprovedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests({ status: filterStatus });
  }, [fetchRequests, filterStatus]);

  const handleRefresh = () => {
    fetchRequests({ status: filterStatus });
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
  };

  const handleViewRequest = (request: typeof requests[0]) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleApproveClick = (request: typeof requests[0]) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (request: typeof requests[0]) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setRejectDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setProcessing(true);
    try {
      const result = await approveRequest(selectedRequest.id, adminNotes || undefined);
      setApprovedCode(result.invite_code);
      toast.success(`Approved! Invite code: ${result.invite_code}`);
    } catch (err) {
      toast.error('Failed to approve request');
      setApproveDialogOpen(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setProcessing(true);
    try {
      const success = await rejectRequest(selectedRequest.id, adminNotes || undefined);
      if (success) {
        toast.success('Request rejected');
        setRejectDialogOpen(false);
      } else {
        toast.error('Failed to reject request');
      }
    } catch {
      toast.error('Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const handleCloseApproveDialog = () => {
    setApproveDialogOpen(false);
    setApprovedCode(null);
    setSelectedRequest(null);
    setAdminNotes('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invite Requests</CardTitle>
              <CardDescription>Review and manage access requests from potential users</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <RefreshButton onClick={handleRefresh} loading={loading} />
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Use Case Preview</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No {filterStatus === 'all' ? '' : filterStatus} requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{request.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {request.use_case}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(request.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              request.status === 'pending' ? 'secondary' :
                              request.status === 'approved' ? 'default' : 'destructive'
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewRequest(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-500 hover:text-green-600"
                                  onClick={() => handleApproveClick(request)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleRejectClick(request)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
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

      {/* View Request Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{selectedRequest.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedRequest.email}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Use Case</Label>
                <div className="mt-1 p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                  {selectedRequest.use_case}
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Submitted: {format(new Date(selectedRequest.created_at), 'MMM d, yyyy h:mm a')}</span>
                <Badge 
                  variant={
                    selectedRequest.status === 'pending' ? 'secondary' :
                    selectedRequest.status === 'approved' ? 'default' : 'destructive'
                  }
                >
                  {selectedRequest.status}
                </Badge>
              </div>
              {selectedRequest.admin_notes && (
                <div>
                  <Label className="text-sm font-medium">Admin Notes</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                    {selectedRequest.admin_notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={handleCloseApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvedCode ? 'Request Approved!' : 'Approve Request'}
            </DialogTitle>
            {!approvedCode && (
              <DialogDescription>
                This will generate an invite code for {selectedRequest?.name}
              </DialogDescription>
            )}
          </DialogHeader>
          {approvedCode ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-2">Invite Code Generated</div>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-lg font-mono font-bold">{approvedCode}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyCode(approvedCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Send this code to <strong>{selectedRequest?.email}</strong>
              </div>
              <Button className="w-full" onClick={handleCloseApproveDialog}>
                Done
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Admin Notes (optional)</Label>
                  <Textarea
                    placeholder="Internal notes about this approval..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseApproveDialog}>
                  Cancel
                </Button>
                <Button onClick={handleApprove} disabled={processing}>
                  {processing ? <LoadingSpinner className="mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Approve & Generate Code
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              This will reject the request from {selectedRequest?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Internal notes about this rejection..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? <LoadingSpinner className="mr-2" /> : <X className="h-4 w-4 mr-2" />}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}