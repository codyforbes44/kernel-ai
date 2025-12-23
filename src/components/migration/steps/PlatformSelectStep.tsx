import { motion } from 'framer-motion';
import { MigrationPlatform, migrationPlatforms } from '@/lib/migration-data';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PlatformSelectStepProps {
  selectedPlatform: MigrationPlatform | null;
  onSelect: (platform: MigrationPlatform) => void;
}

export function PlatformSelectStep({ selectedPlatform, onSelect }: PlatformSelectStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Where are you migrating from?</h2>
        <p className="text-muted-foreground">
          Select your current platform and we'll guide you through the import process
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {migrationPlatforms.map((platform, index) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatform?.id === platform.id;
          
          return (
            <motion.button
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(platform)}
              className={cn(
                'group relative flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-200 text-left',
                'hover:shadow-lg hover:-translate-y-1',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border hover:border-primary/50 bg-card'
              )}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
              
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                  'bg-gradient-to-br',
                  platform.gradient
                )}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="font-semibold text-lg mb-1">{platform.name}</h3>
              <p className="text-sm text-muted-foreground">{platform.description}</p>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {platform.importMethods.map(method => (
                  <span
                    key={method}
                    className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize"
                  >
                    {method === 'zip' ? 'ZIP' : method === 'github' ? 'GitHub' : method}
                  </span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
