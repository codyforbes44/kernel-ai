import { Check, X, Info } from "lucide-react";
import { platforms, PlatformFeature } from "@/lib/pricing-data";
import { FeatureValue } from "./FeatureValue";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

type PlatformKey = "kernel" | "lovable" | "bolt" | "v0" | "replit" | "cursor";

interface MobileFeatureDrawerProps {
  feature: PlatformFeature | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MobileFeatureDrawer = ({
  feature,
  isOpen,
  onClose,
}: MobileFeatureDrawerProps) => {
  if (!feature) return null;

  // Count how many platforms support this feature
  const supportCount = platforms.filter((p) => {
    const key = p.name.toLowerCase() as PlatformKey;
    return feature[key] === true;
  }).length;

  const partialCount = platforms.filter((p) => {
    const key = p.name.toLowerCase() as PlatformKey;
    return typeof feature[key] === "string";
  }).length;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left pb-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DrawerTitle className="text-lg">{feature.name}</DrawerTitle>
              {feature.description && (
                <DrawerDescription className="mt-1">
                  {feature.description}
                </DrawerDescription>
              )}
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto">
          {/* Summary Stats */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
              <span className="text-2xl font-bold text-emerald-400">{supportCount}</span>
              <p className="text-xs text-muted-foreground mt-0.5">Full Support</p>
            </div>
            <div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
              <span className="text-2xl font-bold text-amber-400">{partialCount}</span>
              <p className="text-xs text-muted-foreground mt-0.5">Partial</p>
            </div>
            <div className="flex-1 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
              <span className="text-2xl font-bold text-red-400">
                {platforms.length - supportCount - partialCount}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">Missing</p>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground mb-3">Platform Comparison</h4>
            {platforms.map((platform) => {
              const key = platform.name.toLowerCase() as PlatformKey;
              const value = feature[key];
              const isKernel = platform.name === "Kernel";
              const isSupported = value === true;
              const isPartial = typeof value === "string";

              return (
                <div
                  key={platform.name}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl transition-colors",
                    isKernel
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-muted/30 border border-border/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                        isKernel
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {platform.name.charAt(0)}
                    </div>
                    <div>
                      <span
                        className={cn(
                          "font-medium text-sm",
                          isKernel ? "text-primary" : "text-foreground"
                        )}
                      >
                        {platform.name}
                      </span>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSupported && (
                      <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-400">Yes</span>
                      </div>
                    )}
                    {isPartial && (
                      <div className="flex items-center gap-1.5 bg-amber-500/20 px-2.5 py-1 rounded-full">
                        <span className="text-xs font-medium text-amber-400">{value}</span>
                      </div>
                    )}
                    {!isSupported && !isPartial && (
                      <div className="flex items-center gap-1.5 bg-red-500/20 px-2.5 py-1 rounded-full">
                        <X className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-xs font-medium text-red-400">No</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category Badge */}
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Category</span>
              <span className="text-xs font-medium bg-muted/50 px-2.5 py-1 rounded-full">
                {feature.category}
              </span>
            </div>
          </div>
        </div>

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
