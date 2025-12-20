import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Key, 
  Loader2,
  Save,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EnvVar {
  id: string;
  key: string;
  value: string;
  environment: 'all' | 'preview' | 'production';
  isSecret: boolean;
}

interface EnvVarsManagerProps {
  projectId: string;
}

export function EnvVarsManager({ projectId }: EnvVarsManagerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newEnvironment, setNewEnvironment] = useState<'all' | 'preview' | 'production'>('all');
  const [newIsSecret, setNewIsSecret] = useState(true);
  const [visibleValues, setVisibleValues] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Fetch env vars
  const { data: envVars = [], isLoading } = useQuery({
    queryKey: ['deployment-env-vars', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deployment_env_vars')
        .select('*')
        .eq('project_id', projectId)
        .order('key');
      
      if (error) throw error;
      return (data || []).map((v): EnvVar => ({
        id: v.id,
        key: v.key,
        value: v.value,
        environment: v.environment as EnvVar['environment'],
        isSecret: v.is_secret,
      }));
    },
    enabled: !!projectId && !!user,
  });

  // Add env var mutation
  const addMutation = useMutation({
    mutationFn: async (envVar: Omit<EnvVar, 'id'>) => {
      const { error } = await supabase
        .from('deployment_env_vars')
        .insert({
          project_id: projectId,
          user_id: user!.id,
          key: envVar.key,
          value: envVar.value,
          environment: envVar.environment,
          is_secret: envVar.isSecret,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment-env-vars', projectId] });
      setShowAddForm(false);
      setNewKey('');
      setNewValue('');
      setNewEnvironment('all');
      setNewIsSecret(true);
      toast.success('Environment variable added');
    },
    onError: (error) => {
      toast.error('Failed to add variable', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Update env var mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) => {
      const { error } = await supabase
        .from('deployment_env_vars')
        .update({ value })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment-env-vars', projectId] });
      setEditingId(null);
      setEditValue('');
      toast.success('Variable updated');
    },
    onError: (error) => {
      toast.error('Failed to update variable', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Delete env var mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deployment_env_vars')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment-env-vars', projectId] });
      toast.success('Variable deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete variable', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const handleAdd = () => {
    if (!newKey.trim()) {
      toast.error('Key is required');
      return;
    }
    if (!newValue.trim()) {
      toast.error('Value is required');
      return;
    }
    // Validate key format
    if (!/^[A-Z][A-Z0-9_]*$/.test(newKey)) {
      toast.error('Invalid key format', {
        description: 'Use UPPER_SNAKE_CASE (e.g., API_KEY)',
      });
      return;
    }
    
    addMutation.mutate({
      key: newKey,
      value: newValue,
      environment: newEnvironment,
      isSecret: newIsSecret,
    });
  };

  const toggleVisibility = (id: string) => {
    setVisibleValues(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const startEditing = (envVar: EnvVar) => {
    setEditingId(envVar.id);
    setEditValue(envVar.value);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = (id: string) => {
    updateMutation.mutate({ id, value: editValue });
  };

  const getEnvironmentBadge = (env: EnvVar['environment']) => {
    const styles = {
      all: 'bg-muted text-muted-foreground',
      preview: 'bg-primary/20 text-primary',
      production: 'bg-success/20 text-success',
    };
    return styles[env];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Key className="h-4 w-4" />
          Environment Variables
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add'}
        </Button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="space-y-2 p-3 bg-muted/30 rounded-md border border-border">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">KEY</label>
              <Input
                placeholder="API_KEY"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                className="h-7 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">ENVIRONMENT</label>
              <Select value={newEnvironment} onValueChange={(v) => setNewEnvironment(v as typeof newEnvironment)}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="preview">Preview Only</SelectItem>
                  <SelectItem value="production">Production Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">VALUE</label>
            <Input
              placeholder="Enter value..."
              type={newIsSecret ? 'password' : 'text'}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="h-7 text-xs font-mono"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={newIsSecret}
                onChange={(e) => setNewIsSecret(e.target.checked)}
                className="rounded border-border"
              />
              Mask value (secret)
            </label>
            
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleAdd}
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Env vars list */}
      {envVars.length > 0 ? (
        <ScrollArea className="max-h-[200px]">
          <div className="space-y-1">
            {envVars.map((envVar) => (
              <div
                key={envVar.id}
                className="flex items-center gap-2 p-2 bg-muted/30 rounded-md text-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium truncate">{envVar.key}</span>
                    <Badge className={cn("text-[10px] px-1", getEnvironmentBadge(envVar.environment))}>
                      {envVar.environment}
                    </Badge>
                  </div>
                  
                  {editingId === envVar.id ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-6 text-xs font-mono flex-1"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => saveEdit(envVar.id)}
                        disabled={updateMutation.isPending}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={cancelEditing}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="font-mono text-muted-foreground truncate cursor-pointer hover:text-foreground mt-0.5"
                      onClick={() => startEditing(envVar)}
                      title="Click to edit"
                    >
                      {envVar.isSecret && !visibleValues.has(envVar.id)
                        ? '••••••••'
                        : envVar.value}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {envVar.isSecret && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleVisibility(envVar.id)}
                      title={visibleValues.has(envVar.id) ? 'Hide value' : 'Show value'}
                    >
                      {visibleValues.has(envVar.id) ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(envVar.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">
          No environment variables configured
        </p>
      )}
    </div>
  );
}
