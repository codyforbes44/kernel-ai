import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Crown, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPETITOR_COVERAGE } from "@/lib/compare-data";

interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
}

const Counter = ({ value, duration = 2, className }: CounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth end
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref} className={className}>{count}%</span>;
};

export const AnimatedCoverageCounter = () => {
  const competitors = Object.entries(COMPETITOR_COVERAGE)
    .filter(([key]) => key !== "kernel")
    .sort((a, b) => b[1].score - a[1].score);

  return (
    <div className="relative">
      {/* Main Kernel Counter */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <Crown className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">KERNEL</span>
        </div>
        
        <div className="relative">
          <Counter 
            value={100} 
            duration={2.5}
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-emerald-400 drop-shadow-[0_0_30px_hsl(var(--emerald-400)/0.5)]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="text-lg text-muted-foreground mt-2"
          >
            Feature Coverage
          </motion.div>
        </div>
      </motion.div>

      {/* Competitor Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-3 md:gap-6 flex-wrap"
      >
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <span className="text-xs md:text-sm">Others:</span>
        </div>
        
        {competitors.slice(0, 5).map(([name, data], i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="flex items-center gap-1.5"
          >
            <span className="text-xs text-muted-foreground capitalize">{name}</span>
            <span className={cn(
              "text-sm font-bold",
              data.score >= 60 ? "text-amber-400" : "text-red-400"
            )}>
              <Counter value={data.score} duration={2} />
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
