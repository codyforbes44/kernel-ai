import { motion, Easing } from 'framer-motion';
import { ReactNode } from 'react';

interface HeroEntranceProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const customEasing: Easing = [0.25, 0.46, 0.45, 0.94];

const entranceVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    filter: 'blur(10px)',
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
  },
};


// Staggered container for multiple children
export function HeroEntranceGroup({ 
  children, 
  staggerDelay = 0.1,
  className 
}: { 
  children: ReactNode; 
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.2,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HeroEntranceItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={entranceVariants}
      transition={{
        duration: 0.6,
        ease: customEasing,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
