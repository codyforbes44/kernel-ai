import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'default' | 'warp' | 'slide' | 'fade';
}

const pageVariants = {
  default: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  warp: {
    initial: { 
      opacity: 0, 
      scale: 0.95,
      filter: 'blur(8px)',
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: { 
      opacity: 0, 
      scale: 1.02,
      filter: 'blur(4px)',
    },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

const pageTransitions = {
  default: {
    type: "tween" as const,
    ease: "easeInOut" as const,
    duration: 0.25,
  },
  warp: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    duration: 0.4,
  },
  slide: {
    type: "tween" as const,
    ease: "easeOut" as const,
    duration: 0.3,
  },
  fade: {
    type: "tween" as const,
    ease: "easeOut" as const,
    duration: 0.2,
  },
};

export function PageTransition({ children, variant = 'default' }: PageTransitionProps) {
  const location = useLocation();
  const variants = pageVariants[variant];
  const transition = pageTransitions[variant];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        className={variant === 'warp' ? 'will-change-transform' : undefined}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
