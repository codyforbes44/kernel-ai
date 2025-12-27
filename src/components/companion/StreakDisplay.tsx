import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn?: string | null;
  className?: string;
  compact?: boolean;
}

export function StreakDisplay({ 
  currentStreak, 
  longestStreak, 
  lastCheckIn,
  className,
  compact = false 
}: StreakDisplayProps) {
  const isActiveToday = lastCheckIn === new Date().toISOString().split('T')[0];
  
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-amber-500';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-red-500';
    if (streak >= 3) return 'text-rose-400';
    return 'text-muted-foreground';
  };

  const getFlameIntensity = (streak: number) => {
    if (streak >= 30) return 3;
    if (streak >= 14) return 2;
    if (streak >= 7) return 1;
    return 0;
  };

  const intensity = getFlameIntensity(currentStreak);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <motion.div
          animate={isActiveToday ? { 
            scale: [1, 1.1, 1],
            rotate: [-5, 5, -5, 0]
          } : {}}
          transition={{ duration: 0.5, repeat: isActiveToday ? Infinity : 0, repeatDelay: 2 }}
        >
          <Flame className={cn('h-4 w-4', getStreakColor(currentStreak))} />
        </motion.div>
        <span className={cn('text-sm font-medium', getStreakColor(currentStreak))}>
          {currentStreak}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Current Streak */}
      <motion.div 
        className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
        whileHover={{ scale: 1.02 }}
      >
        <div className="relative">
          <motion.div
            animate={isActiveToday ? { 
              scale: [1, 1.15, 1],
              rotate: [-3, 3, -3, 0]
            } : {}}
            transition={{ duration: 0.6, repeat: isActiveToday ? Infinity : 0, repeatDelay: 1.5 }}
          >
            <Flame className={cn('h-6 w-6', getStreakColor(currentStreak))} />
          </motion.div>
          {intensity >= 2 && (
            <motion.div
              className="absolute -top-1 -right-1"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Flame className={cn('h-3 w-3', getStreakColor(currentStreak))} />
            </motion.div>
          )}
          {intensity >= 3 && (
            <motion.div
              className="absolute -top-1 -left-1"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Flame className={cn('h-3 w-3', getStreakColor(currentStreak))} />
            </motion.div>
          )}
        </div>
        <div>
          <p className={cn('text-lg font-bold', getStreakColor(currentStreak))}>
            {currentStreak}
          </p>
          <p className="text-xs text-muted-foreground">Day streak</p>
        </div>
      </motion.div>

      {/* Best Streak */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
        <Trophy className="h-5 w-5 text-amber-500" />
        <div>
          <p className="text-lg font-bold">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">Best</p>
        </div>
      </div>

      {/* Last Check-in */}
      {lastCheckIn && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {isActiveToday ? 'Today' : new Date(lastCheckIn).toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground">Last active</p>
          </div>
        </div>
      )}
    </div>
  );
}
