import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp, Sparkles, Heart, Zap, Triangle, Code2, MousePointer2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { platforms, platformFeatures, type PlatformFeature } from "@/lib/pricing-data";
import { KernelLogo } from "@/components/ui/kernel-logo";

type Category = PlatformFeature["category"];

// Platform icons mapping
const platformIcons: Record<string, React.ReactNode> = {
  kernel: <KernelLogo className="h-5 w-5" />,
  lovable: <Heart className="h-4 w-4" />,
  bolt: <Zap className="h-4 w-4" />,
  v0: <Triangle className="h-4 w-4" />,
  replit: <Code2 className="h-4 w-4" />,
  cursor: <MousePointer2 className="h-4 w-4" />,
};

const categories: Category[] = [
  "Core",
  "AI Capabilities",
  "Deployment",
  "Collaboration",
  "Developer Experience",
];

function FeatureValue({ value, isKernel = false }: { value: boolean | string; isKernel?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className={cn("h-5 w-5 mx-auto", isKernel ? "text-primary" : "text-emerald-500")} />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
    );
  }
  return (
    <span className={cn(
      "text-sm font-medium",
      isKernel ? "text-primary" : "text-muted-foreground"
    )}>
      {value}
    </span>
  );
}

function CategorySection({ 
  category, 
  features, 
  isExpanded, 
  onToggle 
}: { 
  category: Category; 
  features: PlatformFeature[]; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <span className="font-semibold text-sm text-foreground">{category}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {features.map((feature, idx) => (
              <div
                key={feature.name}
                className={cn(
                  "grid grid-cols-7 items-center border-b border-border/50 last:border-b-0",
                  idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                )}
              >
                <div className="col-span-1 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{feature.name}</p>
                  {feature.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 hidden lg:block">
                      {feature.description}
                    </p>
                  )}
                </div>
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className={cn(
                      "col-span-1 py-3 text-center",
                      platform.isHighlighted && "bg-primary/5"
                    )}
                  >
                    <FeatureValue 
                      value={feature[platform.id as keyof PlatformFeature] as boolean | string}
                      isKernel={platform.isHighlighted}
                    />
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PlatformComparisonChart() {
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(
    new Set(categories)
  );

  const toggleCategory = (category: Category) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedCategories(new Set(categories));
  const collapseAll = () => setExpandedCategories(new Set());

  const getFeaturesByCategory = (category: Category) =>
    platformFeatures.filter((f) => f.category === category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Controls */}
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={expandAll}>
          Expand All
        </Button>
        <Button variant="ghost" size="sm" onClick={collapseAll}>
          Collapse All
        </Button>
      </div>

      {/* Table Container */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-7 bg-muted/50 border-b border-border sticky top-0 z-10">
          <div className="col-span-1 px-4 py-4">
            <span className="text-sm font-semibold text-muted-foreground">Feature</span>
          </div>
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={cn(
                "col-span-1 px-2 py-4 text-center relative",
                platform.isHighlighted && "bg-primary/10"
              )}
            >
              {platform.isHighlighted && (
                <Badge 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 shadow-lg"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Us
                </Badge>
              )}
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  platform.isHighlighted 
                    ? "bg-primary/20 text-primary" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {platformIcons[platform.id]}
                </div>
                <span className={cn(
                  "font-semibold text-sm",
                  platform.isHighlighted ? "text-primary" : "text-foreground"
                )}>
                  {platform.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="divide-y divide-border">
          {categories.map((category) => (
            <CategorySection
              key={category}
              category={category}
              features={getFeaturesByCategory(category)}
              isExpanded={expandedCategories.has(category)}
              onToggle={() => toggleCategory(category)}
            />
          ))}
        </div>
      </div>

      {/* Mobile scroll hint */}
      <p className="text-xs text-muted-foreground text-center mt-4 lg:hidden">
        ← Scroll horizontally to see all platforms →
      </p>
    </motion.div>
  );
}

// Condensed version for Landing page
export function PlatformComparisonCondensed() {
  const highlightedFeatures = [
    "AI Chat Assistant",
    "AI Image Generation",
    "Screenshot-to-UI",
    "One-Click Deploy",
    "Built-in Database",
    "Design System Builder",
    "Component Marketplace",
    "Real-time Cursors",
  ];

  const condensedFeatures = platformFeatures.filter((f) =>
    highlightedFeatures.includes(f.name)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="w-full overflow-x-auto"
    >
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-7 bg-muted/50 border-b border-border">
          <div className="col-span-1 px-4 py-4">
            <span className="text-sm font-semibold text-muted-foreground">Feature</span>
          </div>
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={cn(
                "col-span-1 px-2 py-4 text-center relative",
                platform.isHighlighted && "bg-primary/10"
              )}
            >
              {platform.isHighlighted && (
                <Badge 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Us
                </Badge>
              )}
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  platform.isHighlighted 
                    ? "bg-primary/20 text-primary" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {platformIcons[platform.id]}
                </div>
                <span className={cn(
                  "font-semibold text-sm",
                  platform.isHighlighted ? "text-primary" : "text-foreground"
                )}>
                  {platform.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Body */}
        {condensedFeatures.map((feature, idx) => (
          <div
            key={feature.name}
            className={cn(
              "grid grid-cols-7 items-center border-b border-border/50 last:border-b-0",
              idx % 2 === 0 ? "bg-background" : "bg-muted/10"
            )}
          >
            <div className="col-span-1 px-4 py-3">
              <p className="text-sm font-medium text-foreground">{feature.name}</p>
            </div>
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className={cn(
                  "col-span-1 py-3 text-center",
                  platform.isHighlighted && "bg-primary/5"
                )}
              >
                <FeatureValue 
                  value={feature[platform.id as keyof PlatformFeature] as boolean | string}
                  isKernel={platform.isHighlighted}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}