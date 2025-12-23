import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Search, ShieldCheck, ShieldOff, UserX, UserCheck, 
  CreditCard, Download, MoreHorizontal, AlertTriangle 
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Profile } from '@/types/database';

interface UserWithStats extends Profile {
  email?: string;
  conversation_count?: number;
  message_count?: number;
  last_active?: string;
  is_admin?: boolean;
}

interface UserManagementPanelProps {
  users: UserWithStats[];
  currentUserId: string | undefined;
  onPromote: (userId: string) => Promise<boolean>;
  onDemote: (userId: string) => Promise<boolean>;
  onSuspend: (userId: string, suspend: boolean) => Promise<boolean>;
  onGrantCredits: (userId: string, amount: number) => Promise<boolean>;
  onRefresh: () => void;
}

export function UserManagementPanel({
  users,
  currentUserId,
  onPromote,
  onDemote,
  onSuspend,
  onGrantCredits,
  onRefresh,
}: UserManagementPanelProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [creditAmount, setCreditAmount] = useState('100');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = 
        roleFilter === 'all' ||
        (roleFilter === 'admin' && user.is_admin) ||
        (roleFilter === 'user' && !user.is_admin);
      
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'active' && !user.is_suspended) ||
        (statusFilter === 'suspended' && user.is_suspended);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleAction = async (action: string, userId: string) => {
    setActionLoading(userId);
    let success = false;

    switch (action) {
      case 'promote':
        success = await onPromote(userId);
        if (success) toast.success('User promoted to admin');
        break;
      case 'demote':
        success = await onDemote(userId);
        if (success) toast.success('Admin role removed');
        break;
      case 'suspend':
        success = await onSuspend(userId, true);
        if (success) toast.success('User suspended');
        break;
      case 'unsuspend':
        success = await onSuspend(userId, false);
        if (success) toast.success('User unsuspended');
        break;
    }

    if (!success) toast.error('Action failed');
    setActionLoading(null);
    onRefresh();
  };

  const handleGrantCredits = async () => {
    if (!selectedUser) return;
    
    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setActionLoading(selectedUser.id);
    const success = await onGrantCredits(selectedUser.id, amount);
    
    if (success) {
      toast.success(`Granted ${amount} credits to ${selectedUser.display_name}`);
      setCreditDialogOpen(false);
    } else {
      toast.error('Failed to grant credits');
    }
    
    setActionLoading(null);
    onRefresh();
  };

  const exportUsers = () => {
    const csvContent = [
      ['ID', 'Display Name', 'Role', 'Status', 'Conversations', 'Messages', 'Joined'],
      ...filteredUsers.map(u => [
        u.id,
        u.display_name || 'Unknown',
        u.is_admin ? 'Admin' : 'User',
        u.is_suspended ? 'Suspended' : 'Active',
        u.conversation_count || 0,
        u.message_count || 0,
        format(new Date(u.created_at), 'yyyy-MM-dd'),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Users exported');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                {filteredUsers.length} of {users.length} users
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className={user.is_suspended ? 'opacity-60' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                          {user.display_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium">{user.display_name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.is_suspended ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Suspended
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30 gap-1">
                          <UserCheck className="h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{user.conversation_count} convs</Badge>
                        <Badge variant="outline">{user.message_count} msgs</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            disabled={actionLoading === user.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.is_admin ? (
                            <DropdownMenuItem 
                              onClick={() => handleAction('demote', user.id)}
                              disabled={user.id === currentUserId}
                              className="text-destructive"
                            >
                              <ShieldOff className="h-4 w-4 mr-2" />
                              Remove Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleAction('promote', user.id)}>
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {user.is_suspended ? (
                            <DropdownMenuItem onClick={() => handleAction('unsuspend', user.id)}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Unsuspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleAction('suspend', user.id)}
                              disabled={user.id === currentUserId}
                              className="text-destructive"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setCreditDialogOpen(true);
                          }}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Grant Credits
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Grant Credits Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Credits</DialogTitle>
            <DialogDescription>
              Add credits to {selectedUser?.display_name || 'user'}'s account
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Credit Amount</label>
            <Input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="100"
              min="1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGrantCredits}
              disabled={actionLoading === selectedUser?.id}
            >
              Grant Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
