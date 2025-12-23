import { useState } from 'react';
import { useExternalSupabase, type ExternalSupabaseConnection } from '@/hooks/useExternalSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Database, Plus, Trash2, Edit2, ExternalLink, Check, X, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function ExternalSupabaseSettings() {
  const {
    connections,
    isLoading,
    createConnection,
    updateConnection,
    deleteConnection,
    testConnection,
    isCreating,
    isUpdating,
    isDeleting,
  } = useExternalSupabase();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingConnection, setEditingConnection] = useState<ExternalSupabaseConnection | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showServiceKey, setShowServiceKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    project_name: '',
    supabase_url: '',
    supabase_anon_key: '',
    supabase_service_role_key: '',
  });

  const resetForm = () => {
    setFormData({
      project_name: '',
      supabase_url: '',
      supabase_anon_key: '',
      supabase_service_role_key: '',
    });
    setTestResult(null);
    setShowServiceKey(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleOpenEdit = (connection: ExternalSupabaseConnection) => {
    setFormData({
      project_name: connection.project_name,
      supabase_url: connection.supabase_url,
      supabase_anon_key: connection.supabase_anon_key,
      supabase_service_role_key: connection.supabase_service_role_key || '',
    });
    setEditingConnection(connection);
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!formData.supabase_url || !formData.supabase_anon_key) return;
    
    setIsTesting(true);
    const result = await testConnection(formData.supabase_url, formData.supabase_anon_key);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSubmit = async () => {
    if (editingConnection) {
      await updateConnection({
        id: editingConnection.id,
        ...formData,
      });
      setEditingConnection(null);
    } else {
      await createConnection(formData);
      setShowAddDialog(false);
    }
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteConnection(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">External Supabase Connections</h3>
          <p className="text-sm text-muted-foreground">
            Connect your own Supabase projects to use the database editor and schema generator
          </p>
        </div>
        <Button onClick={handleOpenAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {connections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h4 className="font-medium mb-1">No external connections</h4>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Add your Supabase project credentials to introspect schemas and execute migrations
            </p>
            <Button onClick={handleOpenAdd} className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Connection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{connection.project_name}</CardTitle>
                      <CardDescription className="text-xs font-mono truncate max-w-[300px]">
                        {connection.supabase_url}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connection.is_active && (
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    )}
                    {connection.supabase_service_role_key && (
                      <Badge variant="outline" className="text-xs">Admin Access</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {connection.last_connected_at ? (
                      <>Last used {formatDistanceToNow(new Date(connection.last_connected_at))} ago</>
                    ) : (
                      <>Never connected</>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(connection.supabase_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(connection)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(connection.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={showAddDialog || !!editingConnection} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingConnection(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingConnection ? 'Edit Connection' : 'Add External Supabase Connection'}
            </DialogTitle>
            <DialogDescription>
              Enter your Supabase project credentials. You can find these in your Supabase dashboard under Settings → API.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project_name">Project Name</Label>
              <Input
                id="project_name"
                placeholder="My Supabase Project"
                value={formData.project_name}
                onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabase_url">Project URL</Label>
              <Input
                id="supabase_url"
                placeholder="https://xxxxx.supabase.co"
                value={formData.supabase_url}
                onChange={(e) => setFormData(prev => ({ ...prev, supabase_url: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabase_anon_key">Anon Key (Public)</Label>
              <Input
                id="supabase_anon_key"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={formData.supabase_anon_key}
                onChange={(e) => setFormData(prev => ({ ...prev, supabase_anon_key: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="supabase_service_role_key">
                  Service Role Key (Optional)
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowServiceKey(!showServiceKey)}
                >
                  {showServiceKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Input
                id="supabase_service_role_key"
                type={showServiceKey ? 'text' : 'password'}
                placeholder="Required for executing migrations"
                value={formData.supabase_service_role_key}
                onChange={(e) => setFormData(prev => ({ ...prev, supabase_service_role_key: e.target.value }))}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Required to execute migrations. Keep this key secure.
              </p>
            </div>

            {/* Test Connection */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={isTesting || !formData.supabase_url || !formData.supabase_anon_key}
              >
                {isTesting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
              {testResult !== null && (
                <div className={cn(
                  "flex items-center gap-1.5 text-sm",
                  testResult ? "text-green-600" : "text-destructive"
                )}>
                  {testResult ? (
                    <>
                      <Check className="h-4 w-4" />
                      Connection successful
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      Connection failed
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setEditingConnection(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isCreating || 
                isUpdating || 
                !formData.project_name || 
                !formData.supabase_url || 
                !formData.supabase_anon_key
              }
            >
              {isCreating || isUpdating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editingConnection ? 'Save Changes' : 'Add Connection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the connection and its stored credentials. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
