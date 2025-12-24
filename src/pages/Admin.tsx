import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Shield, Mail, Cpu, MapPin, Eye, Key, Bot } from 'lucide-react';
import { format } from 'date-fns';
import type { Message } from '@/types/database';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { SEO } from '@/components/seo/SEO';
import { PAGE_SEO } from '@/lib/seo';
import { 
  ContactSubmissionsPanel, 
  SystemStatsCards, 
  UserManagementPanel, 
  AIUsagePanel, 
  LoginLocationsPanel, 
  VisitorAnalyticsPanel,
  AdminPanelWrapper,
  TeamAccessSettings,
  XAISettingsPanel
} from '@/components/admin';

export default function Admin() {
  const navigate = useNavigate();
  // Auth is handled by ProtectedRoute wrapper
  const { 
    isAdmin, 
    loading: adminLoading, 
    users, 
    conversations, 
    fetchAllUsers, 
    fetchAllConversations, 
    getConversationMessages, 
    promoteToAdmin, 
    demoteFromAdmin 
  } = useAdmin();
  const { 
    systemStats, 
    aiUsageLogs, 
    loginLocations, 
    pageViews, 
    modelUsageBreakdown,
    loading: statsLoading,
    suspendUser,
    grantCredits,
    refetch
  } = useAdminStats();
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

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

  const handleRefresh = () => {
    fetchAllUsers();
    refetch();
  };

  if (adminLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAdmin) {
    return null;
  }

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
        {/* System Stats Overview */}
        <div className="mb-8">
          <SystemStatsCards stats={systemStats} loading={statsLoading} />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="visitors" className="gap-2">
              <Eye className="h-4 w-4" />
              Visitors
            </TabsTrigger>
            <TabsTrigger value="ai-usage" className="gap-2">
              <Cpu className="h-4 w-4" />
              AI Usage
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              Logins
            </TabsTrigger>
            <TabsTrigger value="conversations" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <Mail className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="team-access" className="gap-2">
              <Key className="h-4 w-4" />
              Team Access
            </TabsTrigger>
            <TabsTrigger value="xai-settings" className="gap-2">
              <Bot className="h-4 w-4" />
              xAI Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminPanelWrapper panelName="User Management" onRetry={handleRefresh}>
              <UserManagementPanel 
                users={users}
                currentUserId={undefined}
                onPromote={promoteToAdmin}
                onDemote={demoteFromAdmin}
                onSuspend={suspendUser}
                onGrantCredits={grantCredits}
                onRefresh={handleRefresh}
                loading={statsLoading}
              />
            </AdminPanelWrapper>
          </TabsContent>

          <TabsContent value="visitors">
            <AdminPanelWrapper panelName="Visitor Analytics" onRetry={refetch}>
              <VisitorAnalyticsPanel pageViews={pageViews} loading={statsLoading} onRefresh={refetch} />
            </AdminPanelWrapper>
          </TabsContent>

          <TabsContent value="ai-usage">
            <AdminPanelWrapper panelName="AI Usage" onRetry={refetch}>
              <AIUsagePanel logs={aiUsageLogs} modelBreakdown={modelUsageBreakdown} loading={statsLoading} onRefresh={refetch} />
            </AdminPanelWrapper>
          </TabsContent>

          <TabsContent value="locations">
            <AdminPanelWrapper panelName="Login Locations" onRetry={refetch}>
              <LoginLocationsPanel locations={loginLocations} loading={statsLoading} onRefresh={refetch} />
            </AdminPanelWrapper>
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

          <TabsContent value="contact">
            <AdminPanelWrapper panelName="Contact Submissions">
              <ContactSubmissionsPanel />
            </AdminPanelWrapper>
          </TabsContent>

          <TabsContent value="team-access">
            <AdminPanelWrapper panelName="Team Access">
              <TeamAccessSettings />
            </AdminPanelWrapper>
          </TabsContent>

          <TabsContent value="xai-settings">
            <AdminPanelWrapper panelName="xAI Settings">
              <XAISettingsPanel />
            </AdminPanelWrapper>
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
