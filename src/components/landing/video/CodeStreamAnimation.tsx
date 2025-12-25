import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CodeStreamAnimationProps {
  isActive: boolean;
  className?: string;
}

const codeLines = [
  { text: "function", color: "text-purple-400" },
  { text: " createApp", color: "text-primary" },
  { text: "() {", color: "text-foreground" },
  { text: "  return (", color: "text-foreground" },
  { text: "    <Dashboard", color: "text-gold" },
  { text: " />", color: "text-foreground" },
  { text: "  );", color: "text-foreground" },
  { text: "}", color: "text-foreground" },
];

export function CodeStreamAnimation({ isActive, className }: CodeStreamAnimationProps) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setVisibleLines(0);
      return;
    }

    const interval = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= codeLines.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className={className}>
      <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border/50 p-4 font-mono text-sm">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-gold/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
          <span className="text-xs text-muted-foreground ml-2">app.tsx</span>
        </div>
        <div className="space-y-1">
          {codeLines.slice(0, visibleLines).map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              <span className="text-muted-foreground/50 w-6 text-right mr-3 select-none">
                {index + 1}
              </span>
              <span className={line.color}>{line.text}</span>
            </motion.div>
          ))}
          {visibleLines < codeLines.length && isActive && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="flex"
            >
              <span className="text-muted-foreground/50 w-6 text-right mr-3">
                {visibleLines + 1}
              </span>
              <span className="text-primary">▋</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
