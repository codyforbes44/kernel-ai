import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProtectedPage } from '@/hooks/useProtectedPage';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Users, MessageSquare, Shield, ShieldCheck, ShieldOff, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Message } from '@/types/database';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { SEO } from '@/components/seo/SEO';
import { PAGE_SEO } from '@/lib/seo';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useProtectedPage();
  const { isAdmin, loading: adminLoading, users, conversations, fetchAllUsers, fetchAllConversations, getConversationMessages, promoteToAdmin, demoteFromAdmin } = useAdmin();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers();
      fetchAllConversations();
    }
  }, [isAdmin]);

  const handleViewConversation = async (conversationId: string) => {
    setSelectedConversation(conversationId);
    setMessagesLoading(true);
    const msgs = await getConversationMessages(conversationId);
    setMessages(msgs);
    setMessagesLoading(false);
  };

  const handlePromote = async (userId: string) => {
    setRoleLoading(userId);
    const success = await promoteToAdmin(userId);
    if (success) {
      toast.success('User promoted to admin');
    } else {
      toast.error('Failed to promote user');
    }
    setRoleLoading(null);
  };

  const handleDemote = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("You can't demote yourself");
      return;
    }
    setRoleLoading(userId);
    const success = await demoteFromAdmin(userId);
    if (success) {
      toast.success('Admin role removed');
    } else {
      toast.error('Failed to demote user');
    }
    setRoleLoading(null);
  };

  if (authLoading || adminLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAdmin) {
    return null;
  }

  const totalMessages = users.reduce((sum, u) => sum + (u.message_count || 0), 0);
  const totalConversations = users.reduce((sum, u) => sum + (u.conversation_count || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={PAGE_SEO.admin.title}
        description={PAGE_SEO.admin.description}
        noIndex={PAGE_SEO.admin.noIndex}
        noFollow={PAGE_SEO.admin.noFollow}
      />
      
      <PageHeader
        title="Admin Panel"
        backLabel="Chat"
        actions={
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
          </div>
        }
      />

      <main className="container mx-auto px-4 py-8">
        {/* Enhanced Analytics Dashboard */}
        <div className="mb-8">
          <AnalyticsDashboard variant="full" showExport />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="conversations" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View all registered users and their activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Conversations</TableHead>
                        <TableHead>Messages</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                                {u.display_name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="font-medium">{u.display_name || 'Unknown'}</div>
                                <div className="text-xs text-muted-foreground">{u.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {u.is_admin ? (
                              <Badge className="bg-primary/20 text-primary border-primary/30">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="outline">User</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{u.conversation_count}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{u.message_count}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(u.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            {u.is_admin ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={u.id === user?.id || roleLoading === u.id}
                                onClick={() => handleDemote(u.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <ShieldOff className="h-4 w-4 mr-1" />
                                {roleLoading === u.id ? 'Loading...' : 'Demote'}
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={roleLoading === u.id}
                                onClick={() => handlePromote(u.id)}
                              >
                                <ShieldCheck className="h-4 w-4 mr-1" />
                                {roleLoading === u.id ? 'Loading...' : 'Promote'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations">
            <Card>
              <CardHeader>
                <CardTitle>All Conversations</CardTitle>
                <CardDescription>View and inspect all system conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Messages</TableHead>
                        <TableHead>Tokens</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conversations.map((conv) => (
                        <TableRow key={conv.id}>
                          <TableCell>
                            <div className="max-w-[200px] truncate font-medium">
                              {conv.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {conv.user_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{conv.message_count}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{conv.token_count?.toLocaleString()}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(conv.updated_at), 'MMM d, HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewConversation(conv.id)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Message Viewer Dialog */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversation Messages
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary/10 ml-8'
                        : msg.role === 'assistant'
                        ? 'bg-muted mr-8'
                        : 'bg-accent/50 text-center text-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={msg.role === 'user' ? 'default' : 'secondary'} className="text-xs">
                        {msg.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.created_at), 'MMM d, HH:mm:ss')}
                      </span>
                      {msg.tokens_used > 0 && (
                        <span className="text-xs text-muted-foreground">
                          • {msg.tokens_used} tokens
                        </span>
                      )}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
