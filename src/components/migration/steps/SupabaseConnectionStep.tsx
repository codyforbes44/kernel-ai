import { motion } from 'framer-motion';
import { SupabaseDetection } from '@/lib/migration-data';
import { SupabaseCredentials } from '@/hooks/useMigrationWizard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  FileCode2, 
  Table2, 
  Key, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  SkipForward
} from 'lucide-react';

interface SupabaseConnectionStepProps {
  detection: SupabaseDetection;
  credentials: SupabaseCredentials | null;
  onCredentialsChange: (credentials: SupabaseCredentials) => void;
  onTestConnection: () => Promise<boolean>;
  connectionTested: boolean;
  connectionValid: boolean;
  isTesting: boolean;
  skipped: boolean;
  onSkip: (skip: boolean) => void;
}

export function SupabaseConnectionStep({
  detection,
  credentials,
  onCredentialsChange,
  onTestConnection,
  connectionTested,
  connectionValid,
  isTesting,
  skipped,
  onSkip,
}: SupabaseConnectionStepProps) {
  const handleChange = (field: keyof SupabaseCredentials, value: string) => {
    onCredentialsChange({
      url: credentials?.url || '',
      anonKey: credentials?.anonKey || '',
      serviceRoleKey: credentials?.serviceRoleKey || '',
      [field]: value,
    });
  };

  if (skipped) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg border border-border bg-muted/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="font-medium text-sm">Supabase connection skipped</p>
              <p className="text-xs text-muted-foreground">
                You can reconnect later in project settings
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onSkip(false)}>
            Configure Now
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Database className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Supabase Connection Detected</h3>
          <p className="text-sm text-muted-foreground">
            Your project uses Supabase. Reconnect to preserve your database setup.
          </p>
        </div>
      </div>

      {/* Detection Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {detection.configFound && (
          <div className="p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileCode2 className="w-4 h-4 text-muted-foreground" />
              Config Found
            </div>
            {detection.projectRef && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                Ref: {detection.projectRef}
              </p>
            )}
          </div>
        )}
        
        {detection.migrationFiles.length > 0 && (
          <div className="p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Table2 className="w-4 h-4 text-muted-foreground" />
              {detection.migrationFiles.length} Migrations
            </div>
            {detection.estimatedTables > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                ~{detection.estimatedTables} tables
              </p>
            )}
          </div>
        )}
        
        {detection.edgeFunctions.length > 0 && (
          <div className="p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileCode2 className="w-4 h-4 text-muted-foreground" />
              {detection.edgeFunctions.length} Edge Functions
            </div>
          </div>
        )}
        
        {detection.envReferences.length > 0 && (
          <div className="p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Key className="w-4 h-4 text-muted-foreground" />
              Env Vars
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {detection.envReferences.slice(0, 2).map(ref => (
                <Badge key={ref} variant="secondary" className="text-xs">
                  {ref}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Credentials Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="supabase-url">Project URL</Label>
          <Input
            id="supabase-url"
            type="url"
            placeholder="https://your-project.supabase.co"
            value={credentials?.url || ''}
            onChange={(e) => handleChange('url', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supabase-anon">Anon Key (Public)</Label>
          <Input
            id="supabase-anon"
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={credentials?.anonKey || ''}
            onChange={(e) => handleChange('anonKey', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supabase-service" className="flex items-center gap-2">
            Service Role Key
            <Badge variant="secondary" className="text-xs">Optional</Badge>
          </Label>
          <Input
            id="supabase-service"
            type="password"
            placeholder="For admin operations (optional)"
            value={credentials?.serviceRoleKey || ''}
            onChange={(e) => handleChange('serviceRoleKey', e.target.value)}
          />
        </div>
      </div>

      {/* Connection Status */}
      {connectionTested && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-3 rounded-lg ${
            connectionValid 
              ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
              : 'bg-destructive/10 text-destructive'
          }`}
        >
          {connectionValid ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Connection successful!</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Connection failed. Check your credentials.</span>
            </>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSkip(true)}
          className="text-muted-foreground"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip for now
        </Button>

        <div className="flex items-center gap-3">
          <a
            href="https://supabase.com/dashboard/project/_/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            Find credentials
            <ExternalLink className="w-3 h-3" />
          </a>
          
          <Button
            onClick={onTestConnection}
            disabled={!credentials?.url || !credentials?.anonKey || isTesting}
          >
            {isTesting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Test Connection
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
