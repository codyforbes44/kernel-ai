import { motion } from 'framer-motion';
import { 
  Brain, 
  FileCode, 
  Search, 
  FolderTree, 
  Wrench, 
  Check, 
  Bug,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentStep } from '@/types/agent';

const stepIconMap: Record<AgentStep['type'], typeof Brain> = {
  think: Brain,
  read_file: FileCode,
  search_files: Search,
  list_files: FolderTree,
  apply_changes: Wrench,
  verify: Check,
  fix_error: Bug,
};

const stepColors: Record<AgentStep['type'], string> = {
  think: 'text-purple-500',
  read_file: 'text-blue-500',
  search_files: 'text-cyan-500',
  list_files: 'text-amber-500',
  apply_changes: 'text-green-500',
  verify: 'text-emerald-500',
  fix_error: 'text-orange-500',
};

interface AnimatedStepIconProps {
  type: AgentStep['type'];
  status: AgentStep['status'];
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedStepIcon({ type, status, size = 'md' }: AnimatedStepIconProps) {
  const Icon = stepIconMap[type];
  const isRunning = status === 'running';
  const isComplete = status === 'complete';
  const isError = status === 'error';
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  const containerSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  if (isRunning) {
    return (
      <div className={cn("relative flex items-center justify-center", containerSizeClasses[size])}>
        {/* Outer pulse ring */}
        <motion.div
          className={cn("absolute inset-0 rounded-full", stepColors[type].replace('text-', 'bg-').replace('500', '500/20'))}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.6, 0.2, 0.6]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Icon with spin */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Icon className={cn(sizeClasses[size], stepColors[type])} />
        </motion.div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        className={cn("flex items-center justify-center", containerSizeClasses[size])}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-green-500/20"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          <Check className={cn(sizeClasses[size], "text-green-500")} />
        </div>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        className={cn("flex items-center justify-center", containerSizeClasses[size])}
        animate={{ 
          x: [0, -3, 3, -3, 3, 0],
        }}
        transition={{ 
          duration: 0.4,
          ease: "easeInOut"
        }}
      >
        <AlertCircle className={cn(sizeClasses[size], "text-destructive")} />
      </motion.div>
    );
  }

  // Pending state
  return (
    <div className={cn("flex items-center justify-center", containerSizeClasses[size])}>
      <Icon className={cn(sizeClasses[size], "text-muted-foreground/50")} />
    </div>
  );
}

interface ThoughtBubbleProps {
  thought: string;
  isActive?: boolean;
}

export function ThoughtBubble({ thought, isActive = true }: ThoughtBubbleProps) {
  return (
    <motion.div
      className="relative p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20"
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ 
        opacity: isActive ? 1 : 0.5, 
        y: 0, 
        scale: 1 
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated thinking indicator */}
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-primary">Thinking...</span>
        {isActive && (
          <motion.div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ 
                  y: [0, -4, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Thought text with streaming effect */}
      <StreamingThought text={thought} />
    </motion.div>
  );
}

function StreamingThought({ text }: { text: string }) {
  return (
    <motion.p
      className="text-sm text-muted-foreground leading-relaxed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {text}
      <motion.span
        className="inline-block w-0.5 h-3 bg-primary/60 ml-0.5 align-middle"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
    </motion.p>
  );
}

interface StepProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  maxIterations: number;
  iterationCount: number;
}

export function StepProgressIndicator({ 
  currentStep, 
  totalSteps, 
  maxIterations, 
  iterationCount 
}: StepProgressIndicatorProps) {
  const stepProgress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const iterationProgress = (iterationCount / maxIterations) * 100;

  return (
    <div className="space-y-3">
      {/* Steps progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Steps</span>
          <span className="font-medium">{currentStep}/{totalSteps}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${stepProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Iterations progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Iterations</span>
          <span className="font-medium">{iterationCount}/{maxIterations}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-500/60 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${iterationProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
