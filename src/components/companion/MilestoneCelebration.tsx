import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Milestone } from '@/types/companion';

interface MilestoneCelebrationProps {
  milestone: Milestone | null;
  onClose: () => void;
  className?: string;
}

const CELEBRATION_COLORS = [
  'hsl(45, 100%, 50%)',   // Gold
  'hsl(280, 100%, 65%)',  // Purple
  'hsl(200, 100%, 50%)',  // Blue
  'hsl(340, 100%, 65%)',  // Pink
  'hsl(140, 70%, 45%)',   // Green
];

function Confetti({ count = 50 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const color = CELEBRATION_COLORS[i % CELEBRATION_COLORS.length];
        const startX = Math.random() * 100;
        const startDelay = Math.random() * 0.5;
        const duration = 2 + Math.random() * 2;
        const rotation = Math.random() * 720 - 360;
        const size = 6 + Math.random() * 8;

        return (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{
              width: size,
              height: size * 0.6,
              backgroundColor: color,
              left: `${startX}%`,
              top: '-20px',
            }}
            initial={{ y: -20, rotate: 0, opacity: 1 }}
            animate={{
              y: '120vh',
              rotate: rotation,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration,
              delay: startDelay,
              ease: 'linear',
            }}
          />
        );
      })}
    </div>
  );
}

function FloatingStars() {
  return (
    <>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            delay: i * 0.15,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <Star 
            className="h-4 w-4 fill-amber-400 text-amber-400" 
          />
        </motion.div>
      ))}
    </>
  );
}

export function MilestoneCelebration({ 
  milestone, 
  onClose,
  className 
}: MilestoneCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (milestone) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [milestone]);

  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            'bg-background/80 backdrop-blur-sm',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {showConfetti && <Confetti />}
          <FloatingStars />

          <motion.div
            className="relative bg-card border rounded-2xl p-8 max-w-sm w-full shadow-2xl overflow-hidden"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-purple-500/20"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative text-center space-y-4">
              {/* Trophy icon with animation */}
              <motion.div
                className="inline-flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [-5, 5, -5, 0],
                }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              >
                <div className="relative">
                  <Trophy className="h-16 w-16 text-amber-500" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <Sparkles className="h-6 w-6 text-amber-400" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Achievement text */}
              <div>
                <motion.p
                  className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Milestone Achieved!
                </motion.p>
                <motion.h2
                  className="text-2xl font-bold mt-2 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {milestone.title}
                </motion.h2>
                <motion.p
                  className="text-muted-foreground mt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {milestone.description}
                </motion.p>
              </div>

              {/* Celebrate button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Awesome!
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
