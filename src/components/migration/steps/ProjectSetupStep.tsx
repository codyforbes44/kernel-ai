import { motion } from 'framer-motion';
import { MigrationPlatform, SupabaseDetection } from '@/lib/migration-data';
import { SupabaseCredentials } from '@/hooks/useMigrationWizard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FolderOpen, MessageSquare, BookOpen } from 'lucide-react';
import { SupabaseConnectionStep } from './SupabaseConnectionStep';

interface ProjectSetupStepProps {
  platform: MigrationPlatform;
  projectName: string;
  projectDescription: string;
  createConversation: boolean;
  enableKnowledgeBase: boolean;
  onProjectNameChange: (name: string) => void;
  onProjectDescriptionChange: (description: string) => void;
  onCreateConversationChange: (value: boolean) => void;
  onEnableKnowledgeBaseChange: (value: boolean) => void;
  // Supabase connection props
  supabaseDetection?: SupabaseDetection | null;
  supabaseCredentials?: SupabaseCredentials | null;
  onSupabaseCredentialsChange?: (credentials: SupabaseCredentials) => void;
  onTestSupabaseConnection?: () => Promise<boolean>;
  supabaseConnectionTested?: boolean;
  supabaseConnectionValid?: boolean;
  isTestingSupabaseConnection?: boolean;
  skipSupabaseConnection?: boolean;
  onSkipSupabaseConnection?: (skip: boolean) => void;
}

export function ProjectSetupStep({
  platform,
  projectName,
  projectDescription,
  createConversation,
  enableKnowledgeBase,
  onProjectNameChange,
  onProjectDescriptionChange,
  onCreateConversationChange,
  onEnableKnowledgeBaseChange,
  supabaseDetection,
  supabaseCredentials,
  onSupabaseCredentialsChange,
  onTestSupabaseConnection,
  supabaseConnectionTested,
  supabaseConnectionValid,
  isTestingSupabaseConnection,
  skipSupabaseConnection,
  onSkipSupabaseConnection,
}: ProjectSetupStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Set Up Your Project</h2>
        <p className="text-muted-foreground">
          Configure your imported project settings
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto space-y-6"
      >
        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="project-name" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Project Name
          </Label>
          <Input
            id="project-name"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder="My Awesome Project"
          />
        </div>

        {/* Project Description */}
        <div className="space-y-2">
          <Label htmlFor="project-description">Description (optional)</Label>
          <Textarea
            id="project-description"
            value={projectDescription}
            onChange={(e) => onProjectDescriptionChange(e.target.value)}
            placeholder="A brief description of your project..."
            rows={3}
          />
        </div>

        {/* Options */}
        <div className="space-y-4 pt-4 border-t border-border">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="create-conversation" className="font-medium cursor-pointer">
                  Start a Conversation
                </Label>
                <p className="text-sm text-muted-foreground">
                  Create an AI chat to help you customize your project
                </p>
              </div>
            </div>
            <Switch
              id="create-conversation"
              checked={createConversation}
              onCheckedChange={onCreateConversationChange}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="enable-knowledge" className="font-medium cursor-pointer">
                  Enable Knowledge Base
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add custom context to help the AI understand your project
                </p>
              </div>
            </div>
            <Switch
              id="enable-knowledge"
              checked={enableKnowledgeBase}
              onCheckedChange={onEnableKnowledgeBaseChange}
            />
          </motion.div>
        </div>

        {/* Supabase Connection Section */}
        {supabaseDetection?.hasSupabase && onSupabaseCredentialsChange && onTestSupabaseConnection && onSkipSupabaseConnection && (
          <div className="pt-4 border-t border-border">
            <SupabaseConnectionStep
              detection={supabaseDetection}
              credentials={supabaseCredentials || null}
              onCredentialsChange={onSupabaseCredentialsChange}
              onTestConnection={onTestSupabaseConnection}
              connectionTested={supabaseConnectionTested || false}
              connectionValid={supabaseConnectionValid || false}
              isTesting={isTestingSupabaseConnection || false}
              skipped={skipSupabaseConnection || false}
              onSkip={onSkipSupabaseConnection}
            />
          </div>
        )}

        {/* Migration note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-muted-foreground"
        >
          Importing from {platform.name} • All your code will be preserved
        </motion.div>
      </motion.div>
    </div>
  );
}
