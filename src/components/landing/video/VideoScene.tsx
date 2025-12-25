import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface VideoSceneProps {
  children: ReactNode;
  isActive: boolean;
  className?: string;
}

export function VideoScene({ children, isActive, className }: VideoSceneProps) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
