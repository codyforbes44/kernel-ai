import { motion } from "framer-motion";
import { Globe, Check } from "lucide-react";

interface DeployAnimationProps {
  isActive: boolean;
  className?: string;
}

export function DeployAnimation({ isActive, className }: DeployAnimationProps) {
  return (
    <div className={className}>
      <div className="relative flex flex-col items-center justify-center">
        {/* Rocket */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={isActive ? { y: -20, opacity: 1 } : { y: 60, opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10"
        >
          <div className="text-4xl">🚀</div>
          
          {/* Rocket trail */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={isActive ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-16 bg-gradient-to-b from-gold/80 via-primary/50 to-transparent origin-top rounded-full"
          />
        </motion.div>

        {/* Globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <motion.div
            animate={isActive ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <Globe className="h-12 w-12 text-primary" />
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={isActive ? { boxShadow: ["0 0 20px hsl(var(--primary) / 0.3)", "0 0 40px hsl(var(--primary) / 0.5)", "0 0 20px hsl(var(--primary) / 0.3)"] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        {/* LIVE Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 10 }}
          animate={isActive ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0, y: 10 }}
          transition={{ duration: 0.4, delay: 1.4, type: "spring", stiffness: 300 }}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full"
        >
          <motion.div
            animate={isActive ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-500"
          />
          <span className="text-green-400 font-semibold text-sm flex items-center gap-1">
            LIVE <Check className="h-3 w-3" />
          </span>
        </motion.div>
      </div>
    </div>
  );
}
