import { motion } from 'framer-motion';
import { MigrationPlatform, kernelFeatures, KernelFeature } from '@/lib/migration-data';
import { cn } from '@/lib/utils';
import { Sparkles, Database, Rocket, Users, Cpu, Check } from 'lucide-react';

interface FeatureDiscoveryStepProps {
  platform: MigrationPlatform;
}

const categoryIcons: Record<KernelFeature['category'], React.ElementType> = {
  ai: Cpu,
  builder: Sparkles,
  backend: Database,
  deploy: Rocket,
  collab: Users,
};

const categoryLabels: Record<KernelFeature['category'], string> = {
  ai: 'AI Capabilities',
  builder: 'Visual Builder',
  backend: 'Backend & Data',
  deploy: 'Deployment',
  collab: 'Collaboration',
};

const categoryColors: Record<KernelFeature['category'], string> = {
  ai: 'from-purple-500 to-pink-500',
  builder: 'from-blue-500 to-cyan-500',
  backend: 'from-green-500 to-emerald-500',
  deploy: 'from-orange-500 to-red-500',
  collab: 'from-indigo-500 to-violet-500',
};

export function FeatureDiscoveryStep({ platform }: FeatureDiscoveryStepProps) {
  // Group features by category
  const groupedFeatures = kernelFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<KernelFeature['category'], KernelFeature[]>);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold">Welcome to Kernel!</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Here's what you'll unlock compared to {platform.name}
        </p>
      </div>

      {/* Highlighted features from platform */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            New features unlocked from {platform.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {platform.featuresGained.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="flex items-start gap-2"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* All features by category */}
      <div className="space-y-6">
        {(Object.keys(groupedFeatures) as KernelFeature['category'][]).map((category, catIndex) => {
          const Icon = categoryIcons[category];
          const features = groupedFeatures[category];
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + catIndex * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br',
                  categoryColors[category]
                )}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-medium">{categoryLabels[category]}</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + catIndex * 0.1 + index * 0.03 }}
                    className="p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
