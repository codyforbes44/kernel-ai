import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MobileFeatureCard } from "./MobileFeatureCard";
import { MobileFeatureDrawer } from "./MobileFeatureDrawer";
import { PlatformFeature } from "@/lib/pricing-data";
import { cn } from "@/lib/utils";

interface MobileCategoryAccordionProps {
  category: string;
  features: PlatformFeature[];
  defaultOpen?: boolean;
}

export const MobileCategoryAccordion = ({
  category,
  features,
  defaultOpen = false,
}: MobileCategoryAccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [selectedFeature, setSelectedFeature] = useState<PlatformFeature | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleFeatureTap = (feature: PlatformFeature) => {
    setSelectedFeature(feature);
    setIsDrawerOpen(true);
  };

  return (
    <>
      <div className="border border-border/50 rounded-xl overflow-hidden bg-card/50">
        {/* Category Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors active:bg-muted/60"
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground">{category}</span>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {features.length} features
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Features List */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="p-3 space-y-2">
            {features.map((feature, index) => (
              <MobileFeatureCard
                key={feature.name}
                feature={feature}
                index={index}
                onTap={handleFeatureTap}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Feature Detail Drawer */}
      <MobileFeatureDrawer
        feature={selectedFeature}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};
