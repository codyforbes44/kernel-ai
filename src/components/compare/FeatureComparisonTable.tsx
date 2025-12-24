import { platformFeatures, platforms } from "@/lib/pricing-data";
import { FeatureValue } from "./FeatureValue";
import { CompareLegend } from "./CompareLegend";
import { cn } from "@/lib/utils";

type PlatformKey = "kernel" | "lovable" | "bolt" | "v0" | "replit" | "cursor";

export const FeatureComparisonTable = () => {
  const groupedFeatures = platformFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, typeof platformFeatures>);

  return (
    <section className="py-16 border-t border-border/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Complete Feature Comparison
          </h2>
          <p className="text-muted-foreground">
            All {platformFeatures.length} features compared across {platforms.length} platforms
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-7 gap-2 mb-4 sticky top-0 bg-background/95 backdrop-blur py-4 z-10">
              <div className="col-span-1 font-semibold text-muted-foreground text-sm">
                Feature
              </div>
              {platforms.map((platform) => (
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
                    "font-semibold",
                    platform.name === "Kernel" ? "text-primary" : "text-foreground"
                  )}>
                    {platform.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Features by Category */}
            {Object.entries(groupedFeatures).map(([category, features]) => (
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
                {features.map((feature, index) => (
                  <div
                    key={feature.name}
                    className={cn(
                      "grid grid-cols-7 gap-2 items-center py-3 px-4 rounded-lg transition-colors",
                      index % 2 === 0 ? "bg-muted/10" : "bg-transparent",
                      "hover:bg-muted/20"
                    )}
                  >
                    <div className="col-span-1">
                      <span className="text-sm font-medium text-foreground">
                        {feature.name}
                      </span>
                    </div>
                    {platforms.map((platform) => {
                      const key = platform.name.toLowerCase() as PlatformKey;
                      return (
                        <FeatureValue 
                          key={platform.name} 
                          value={feature[key]} 
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <CompareLegend />
      </div>
    </section>
  );
};
