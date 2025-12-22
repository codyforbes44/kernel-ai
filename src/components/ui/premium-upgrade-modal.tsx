import * as React from "react";
import { Crown, Sparkles, Zap, Shield, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DialogProps } from "@radix-ui/react-dialog";

interface PremiumUpgradeModalProps extends Omit<DialogProps, 'children'> {
  featureName?: string;
  onUpgrade?: () => void;
}

const benefits = [
  "Unlimited AI-powered code generation",
  "Advanced security features & audit logs",
  "Custom domains with auto SSL",
  "Priority 24/7 support",
  "Analytics dashboard & insights",
  "Multi-file refactoring tools",
];

export const PremiumUpgradeModal = React.forwardRef<
  HTMLDivElement,
  PremiumUpgradeModalProps
>(function PremiumUpgradeModal({ featureName, onUpgrade, ...dialogProps }, ref) {
  return (
    <Dialog {...dialogProps}>
      <DialogContent ref={ref} className="sm:max-w-md overflow-hidden border-gold/30 bg-gradient-to-br from-background via-background to-gold/5">
        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
        
        {/* Corner glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gold/5 rounded-full blur-3xl" />
        
        <DialogHeader className="relative">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 rounded-full bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30">
                <Crown className="h-8 w-8 text-gold" />
              </div>
            </div>
          </div>
          
          <Badge className="w-fit mx-auto mb-2 bg-gold/10 text-gold border-gold/30">
            <Sparkles className="h-3 w-3 mr-1" />
            Pro Feature
          </Badge>
          
          <DialogTitle className="text-2xl text-center">
            Unlock {featureName || "Premium Features"}
          </DialogTitle>
          
          <DialogDescription className="text-center">
            {featureName 
              ? `${featureName} is available exclusively for Pro members. Upgrade now to unlock this and all other premium features.`
              : "Upgrade to Pro to unlock all premium features and supercharge your development workflow."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative py-4">
          {/* Benefits list */}
          <div className="space-y-3 mb-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 text-sm"
              >
                <div className="shrink-0 p-1 rounded-full bg-gold/10">
                  <Check className="h-3 w-3 text-gold" />
                </div>
                <span className="text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
          
          {/* Pricing highlight */}
          <div className="rounded-lg border border-gold/20 bg-gold/5 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Starting at</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$19</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-gold" />
                <Shield className="h-5 w-5 text-gold" />
              </div>
            </div>
          </div>
          
          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              variant="gold" 
              size="lg" 
              className="w-full shadow-[0_0_20px_hsl(var(--gold)/0.3)]"
              onClick={() => {
                onUpgrade?.();
                dialogProps.onOpenChange?.(false);
              }}
            >
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Pro
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground"
              onClick={() => dialogProps.onOpenChange?.(false)}
            >
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

PremiumUpgradeModal.displayName = "PremiumUpgradeModal";

// Hook for easy modal management
export function usePremiumUpgradeModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [featureName, setFeatureName] = React.useState<string | undefined>();

  const openModal = React.useCallback((feature?: string) => {
    setFeatureName(feature);
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    featureName,
    openModal,
    closeModal,
    setIsOpen,
  };
}
