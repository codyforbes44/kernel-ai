import { platformFeatures, platforms } from "@/lib/pricing-data";
import { FeatureValue } from "./FeatureValue";
import { CompareLegend } from "./CompareLegend";
import { MobileCategoryAccordion } from "./MobileCategoryAccordion";
import { EXCLUSIVE_FEATURES, COMPETITOR_COVERAGE } from "@/lib/compare-data";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";

type PlatformKey = "kernel" | "lovable" | "bolt" | "v0" | "replit" | "cursor";

export const FeatureComparisonTable = () => {
  const groupedFeatures = platformFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, typeof platformFeatures>);

  const categories = Object.entries(groupedFeatures);

  return (
    <section className="py-12 md:py-16 border-t border-border/50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
            Complete Feature Comparison
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-2">
            All {platformFeatures.length} features compared across {platforms.length} platforms
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-primary">
            <Crown className="w-3 h-3" />
            <span>Exclusive features highlighted</span>
          </div>
        </div>

        {/* Mobile: Accordion View */}
        <div className="lg:hidden space-y-3">
          {categories.map(([category, features], index) => (
            <MobileCategoryAccordion
              key={category}
              category={category}
              features={features}
              defaultOpen={index === 0}
            />
          ))}
          <CompareLegend />
        </div>

        {/* Desktop: Full Grid View */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Sticky Header with Coverage Scores */}
            <div className="grid grid-cols-7 gap-2 mb-4 sticky top-0 bg-background/95 backdrop-blur py-4 z-10 border-b border-border/50">
              <div className="col-span-1 font-semibold text-muted-foreground text-sm">
                Feature
              </div>
              {platforms.map((platform) => {
                const key = platform.name.toLowerCase() as keyof typeof COMPETITOR_COVERAGE;
                const coverage = COMPETITOR_COVERAGE[key];
                return (
                  <div
                    key={platform.name}
                    className={cn(
                      "text-center py-3 px-2 rounded-lg",
                      platform.name === "Kernel"
                        ? "bg-primary/20 border border-primary/40"
                        : "bg-muted/30"
                    )}
                  >
                    <span className={cn(
                      "font-semibold block",
                      platform.name === "Kernel" ? "text-primary" : "text-foreground"
                    )}>
                      {platform.name}
                    </span>
                    <span className={cn(
                      "text-xs font-bold",
                      coverage.score === 100 ? "text-emerald-400" :
                      coverage.score >= 60 ? "text-amber-400" : "text-red-400"
                    )}>
                      {coverage.score}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Features by Category */}
            {categories.map(([category, features]) => (
              <div key={category} className="mb-6">
                {/* Category Header */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  <div className="col-span-7 bg-muted/50 py-2 px-4 rounded-lg">
                    <span className="font-semibold text-sm text-foreground">
                      {category}
                    </span>
                  </div>
                </div>

                {/* Category Features */}
                {features.map((feature, index) => {
                  const isExclusive = EXCLUSIVE_FEATURES.includes(feature.name as typeof EXCLUSIVE_FEATURES[number]);
                  return (
                    <div
                      key={feature.name}
                      className={cn(
                        "grid grid-cols-7 gap-2 items-center py-3 px-4 rounded-lg transition-colors",
                        index % 2 === 0 ? "bg-muted/10" : "bg-transparent",
                        "hover:bg-muted/20",
                        isExclusive && "ring-1 ring-primary/30 bg-primary/5"
                      )}
                    >
                      <div className="col-span-1 flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium",
                          isExclusive ? "text-primary" : "text-foreground"
                        )}>
                          {feature.name}
                        </span>
                        {isExclusive && (
                          <Crown className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      {platforms.map((platform) => {
                        const key = platform.name.toLowerCase() as PlatformKey;
                        const value = feature[key];
                        return (
                          <div
                            key={platform.name}
                            className={cn(
                              "rounded-md py-1",
                              value === true && "bg-emerald-500/10",
                              value === false && "bg-red-500/5",
                              typeof value === "string" && "bg-amber-500/10"
                            )}
                          >
                            <FeatureValue value={value} />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <CompareLegend />
        </div>
      </div>
    </section>
  );
};
