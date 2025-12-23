import { motion } from 'framer-motion';
import { MigrationPlatform, ImportMethod, importMethodLabels } from '@/lib/migration-data';
import { cn } from '@/lib/utils';
import { Upload, Github, Code, Link, Check, Share2 } from 'lucide-react';

interface ImportMethodStepProps {
  platform: MigrationPlatform;
  selectedMethod: ImportMethod | null;
  onSelect: (method: ImportMethod) => void;
}

const methodIcons: Record<ImportMethod, React.ElementType> = {
  zip: Upload,
  github: Github,
  paste: Code,
  url: Link,
  shareCode: Share2,
};

export function ImportMethodStep({ platform, selectedMethod, onSelect }: ImportMethodStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">How would you like to import?</h2>
        <p className="text-muted-foreground">
          Choose the import method that works best for your {platform.name} project
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {platform.importMethods.map((method, index) => {
          const Icon = methodIcons[method];
          const info = importMethodLabels[method];
          const isSelected = selectedMethod === method;
          
          return (
            <motion.button
              key={method}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(method)}
              className={cn(
                'group relative flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 text-left',
                'hover:shadow-md hover:-translate-y-0.5',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/50 bg-card'
              )}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}

              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                  'bg-muted group-hover:bg-primary/10 transition-colors',
                  isSelected && 'bg-primary/10'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 transition-colors',
                  isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                )} />
              </div>

              <div>
                <h3 className="font-medium mb-0.5">{info.label}</h3>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {platform.migrationTips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
            <h4 className="font-medium text-sm mb-2 text-muted-foreground">
              Tips for {platform.name}
            </h4>
            <ul className="space-y-1.5">
              {platform.migrationTips.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
