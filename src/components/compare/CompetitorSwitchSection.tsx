import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HoloCard } from "@/components/ui/holo-card";
import { HoloSection } from "@/components/ui/holo-section";
import { GlowText } from "@/components/ui/glow-text";
import { COMPETITOR_COVERAGE } from "@/lib/compare-data";
import { cn } from "@/lib/utils";

interface SwitchCardProps {
  competitor: string;
  gaps: readonly string[];
  delay: number;
}

const SwitchCard = ({ competitor, gaps, delay }: SwitchCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
  >
    <HoloCard variant="bordered" className="h-full">
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-foreground">Coming from</span>
          <span className="text-lg font-bold text-muted-foreground">{competitor}?</span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Here's what you've been missing:
        </p>
        
        <ul className="space-y-2 mb-6">
          {gaps.slice(0, 3).map((gap) => (
            <li key={gap} className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground">{gap}</span>
            </li>
          ))}
          {gaps.length > 3 && (
            <li className="text-xs text-muted-foreground pl-6">
              +{gaps.length - 3} more features
            </li>
          )}
        </ul>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <Check className="w-4 h-4" />
            <span>Get all features with Kernel</span>
          </div>
          <Button variant="outline" size="sm" className="w-full group" asChild>
            <Link to="/request-invite">
              Switch to Kernel
              <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </HoloCard>
  </motion.div>
);

export const CompetitorSwitchSection = () => {
  const competitorsWithGaps = Object.entries(COMPETITOR_COVERAGE)
    .filter(([key, data]) => key !== "kernel" && "gaps" in data && data.gaps.length > 0)
    .map(([key, data]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      gaps: (data as { gaps: readonly string[] }).gaps,
    }));

  return (
    <HoloSection variant="gradient" className="py-16 md:py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">Switching is Easy</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            <GlowText variant="gradient" as="span">
              Stop Settling for Less
            </GlowText>
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every competitor leaves you missing critical features. 
            Switch to Kernel and get <span className="text-primary font-semibold">everything</span> in one platform.
          </p>
        </motion.div>
        
        {/* Switch Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {competitorsWithGaps.slice(0, 6).map((competitor, i) => (
            <SwitchCard
              key={competitor.name}
              competitor={competitor.name}
              gaps={competitor.gaps}
              delay={i * 0.1}
            />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-10 md:mt-12"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Join developers who made the switch to 100% feature coverage
          </p>
          <Button size="lg" asChild>
            <Link to="/request-invite">
              Get Everything with Kernel
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </HoloSection>
  );
};
