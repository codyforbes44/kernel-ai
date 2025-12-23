import { motion } from 'framer-motion';
import { MigrationPlatform } from '@/lib/migration-data';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Code, Sparkles, BookOpen, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuccessStepProps {
  platform: MigrationPlatform;
  projectName: string;
  projectId: string | null;
}

export function SuccessStep({ platform, projectName, projectId }: SuccessStepProps) {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Code,
      label: 'Open in Builder',
      description: 'Start editing your project',
      action: () => navigate(`/builder/${projectId}`),
      primary: true,
    },
    {
      icon: Sparkles,
      label: 'Try AI Chat',
      description: 'Get AI help customizing your project',
      action: () => navigate(`/builder/${projectId}?panel=chat`),
      primary: false,
    },
    {
      icon: BookOpen,
      label: 'Read Docs',
      description: 'Learn about Kernel features',
      action: () => navigate('/docs'),
      primary: false,
    },
  ];

  const tips = [
    'Use the Visual Editor to make quick UI changes without code',
    'Check out the Component Marketplace for pre-built components',
    'Set up your Design System for consistent styling',
    'Connect your GitHub repo for version control',
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative mx-auto w-20 h-20"
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-2">Migration Complete!</h2>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{projectName}</span> has been imported from {platform.name}
          </p>
        </motion.div>
      </div>

      {/* Action cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
      >
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={action.action}
              className={`group flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                action.primary
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                action.primary ? 'bg-primary-foreground/20' : 'bg-muted'
              }`}>
                <Icon className={`w-6 h-6 ${action.primary ? '' : 'text-muted-foreground group-hover:text-primary'}`} />
              </div>
              <h3 className="font-semibold mb-1">{action.label}</h3>
              <p className={`text-sm ${action.primary ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {action.description}
              </p>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Quick tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-muted/50 rounded-xl p-6 border border-border/50">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Quick Tips to Get Started
          </h3>
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className="flex items-start gap-3 text-sm"
              >
                <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{tip}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <Button variant="link" className="text-muted-foreground" onClick={() => navigate('/builder')}>
          Go to Projects
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
