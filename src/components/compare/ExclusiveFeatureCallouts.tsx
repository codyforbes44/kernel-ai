import { motion } from "framer-motion";
import { Crown, Palette, Layers, Sparkles, Check, Box, Grid3X3, Wand2 } from "lucide-react";
import { HoloSection } from "@/components/ui/holo-section";
import { HoloCard } from "@/components/ui/holo-card";
import { GlowText } from "@/components/ui/glow-text";
import { HoloBadge } from "@/components/ui/holo-badge";
import { cn } from "@/lib/utils";

const DesignSystemDemo = () => (
  <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50">
    {/* Header */}
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border/50">
      <div className="flex gap-1">
        <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
      </div>
      <span className="text-[10px] text-muted-foreground">Design System Builder</span>
    </div>
    
    {/* Content */}
    <div className="p-4 space-y-4">
      {/* Color palette */}
      <div>
        <p className="text-[10px] text-muted-foreground mb-2 font-medium flex items-center gap-1">
          <Palette className="w-3 h-3" /> Colors
        </p>
        <div className="flex gap-2">
          {[
            { name: "Primary", color: "bg-primary" },
            { name: "Secondary", color: "bg-secondary" },
            { name: "Accent", color: "bg-accent" },
            { name: "Muted", color: "bg-muted" },
          ].map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.3, type: "spring" }}
              className="flex flex-col items-center gap-1"
            >
              <div className={cn("w-8 h-8 rounded-lg shadow-md", c.color)} />
              <span className="text-[8px] text-muted-foreground">{c.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Typography */}
      <div>
        <p className="text-[10px] text-muted-foreground mb-2 font-medium flex items-center gap-1">
          <span className="font-serif">Aa</span> Typography
        </p>
        <div className="space-y-1">
          <motion.p
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-sm font-bold text-foreground"
          >
            Heading Bold
          </motion.p>
          <motion.p
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-xs text-muted-foreground"
          >
            Body text regular
          </motion.p>
        </div>
      </div>
      
      {/* Spacing */}
      <div>
        <p className="text-[10px] text-muted-foreground mb-2 font-medium flex items-center gap-1">
          <Grid3X3 className="w-3 h-3" /> Spacing Scale
        </p>
        <div className="flex items-end gap-1">
          {[4, 8, 12, 16, 24].map((size, i) => (
            <motion.div
              key={size}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 + 0.7, type: "spring" }}
              style={{ height: size, width: 12 }}
              className="bg-primary/60 rounded-sm origin-bottom"
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MarketplaceDemo = () => (
  <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50">
    {/* Header */}
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border/50">
      <div className="flex gap-1">
        <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
      </div>
      <span className="text-[10px] text-muted-foreground">Component Marketplace</span>
    </div>
    
    {/* Content */}
    <div className="p-4">
      <div className="grid grid-cols-2 gap-2">
        {[
          { name: "Auth Form", icon: Box, installs: "2.4k" },
          { name: "Data Table", icon: Grid3X3, installs: "1.8k" },
          { name: "Charts", icon: Layers, installs: "3.2k" },
          { name: "AI Chat", icon: Wand2, installs: "4.1k" },
        ].map((comp, i) => (
          <motion.div
            key={comp.name}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 + 0.3, type: "spring" }}
            whileHover={{ scale: 1.02 }}
            className="p-2.5 rounded-lg bg-card/60 border border-border/50 hover:border-primary/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                <comp.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[11px] font-medium text-foreground">{comp.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground">{comp.installs} installs</span>
              <span className="text-[8px] text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">Free</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* One-click install indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="mt-3 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/10 border border-primary/30"
      >
        <Sparkles className="w-3 h-3 text-primary" />
        <span className="text-[10px] text-primary font-medium">One-Click Install to Any Project</span>
      </motion.div>
    </div>
  </div>
);

interface FeatureCalloutProps {
  title: string;
  description: string;
  benefits: string[];
  demo: React.ReactNode;
  reversed?: boolean;
}

const FeatureCallout = ({ title, description, benefits, demo, reversed }: FeatureCalloutProps) => (
  <div className={cn(
    "grid md:grid-cols-2 gap-6 lg:gap-12 items-center",
    reversed && "md:[&>*:first-child]:order-2"
  )}>
    {/* Content */}
    <motion.div
      initial={{ opacity: 0, x: reversed ? 30 : -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-5 h-5 text-primary" />
        <HoloBadge variant="glow" className="text-[10px]">
          KERNEL EXCLUSIVE
        </HoloBadge>
      </div>
      
      <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3">
        <GlowText variant="gradient">{title}</GlowText>
      </h3>
      
      <p className="text-muted-foreground mb-4 md:mb-6">
        {description}
      </p>
      
      <ul className="space-y-2">
        {benefits.map((benefit, i) => (
          <motion.li
            key={benefit}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 + 0.3 }}
            className="flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-sm text-foreground">{benefit}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
    
    {/* Demo */}
    <motion.div
      initial={{ opacity: 0, x: reversed ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <HoloCard variant="bordered" hover={false} className="overflow-hidden">
        {demo}
      </HoloCard>
    </motion.div>
  </div>
);

export const ExclusiveFeatureCallouts = () => {
  return (
    <HoloSection variant="default" className="py-16 md:py-20 lg:py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Kernel Exclusive Features</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            <GlowText variant="gradient" as="span">
              Features Only Kernel Has
            </GlowText>
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            While competitors stop at basic code generation, Kernel provides complete 
            design-to-deployment infrastructure that no one else offers.
          </p>
        </motion.div>
        
        {/* Feature 1: Design System Builder */}
        <div className="mb-16 md:mb-20">
          <FeatureCallout
            title="Design System Builder"
            description="Create, manage, and evolve your design tokens visually. Generate consistent themes across your entire application with AI-powered suggestions."
            benefits={[
              "Visual color palette and typography management",
              "AI-suggested design tokens based on your brand",
              "Automatic CSS variable generation",
              "Dark/light mode variants in one click",
              "Export to any framework or platform",
            ]}
            demo={<DesignSystemDemo />}
          />
        </div>
        
        {/* Feature 2: Component Marketplace */}
        <FeatureCallout
          title="Component Marketplace"
          description="Access thousands of production-ready components built by the community. Install with one click, customize with AI, and ship faster than ever."
          benefits={[
            "1000+ production-ready components",
            "One-click installation to any project",
            "AI-powered customization and theming",
            "Community ratings and reviews",
            "Automatic dependency management",
          ]}
          demo={<MarketplaceDemo />}
          reversed
        />
        
        {/* Comparison reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 md:mt-20 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 md:p-6 rounded-xl bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 border border-amber-500/30">
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-amber-400 mb-1">
                🚫 Not available on Lovable, Bolt, v0, or Cursor
              </p>
              <p className="text-xs text-muted-foreground">
                These features are exclusive to Kernel — the only complete AI development platform.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </HoloSection>
  );
};
