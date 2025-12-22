import * as React from "react";
import { cn } from "@/lib/utils";
import { Crown, Sparkles, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  features?: string[];
  locked?: boolean;
  onUpgrade?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function PremiumFeatureCard({
  title,
  description,
  icon,
  features,
  locked = false,
  onUpgrade,
  className,
  children,
}: PremiumFeatureCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-gold/30 bg-gradient-to-br from-gold/5 via-background to-gold/10",
        "shadow-[0_0_20px_hsl(var(--gold)/0.1)] hover:shadow-[0_0_30px_hsl(var(--gold)/0.2)]",
        "transition-all duration-300",
        className
      )}
    >
      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
      
      {/* Subtle corner glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2.5 rounded-lg bg-gold/10 text-gold border border-gold/20">
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {title}
                {locked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <Badge className="bg-gold/10 text-gold border-gold/30 gap-1">
            <Crown className="h-3 w-3" />
            Pro
          </Badge>
        </div>

        {/* Features list */}
        {features && features.length > 0 && (
          <ul className="space-y-2 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-gold shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Children content */}
        {children}

        {/* Upgrade button for locked state */}
        {locked && onUpgrade && (
          <div className="mt-4 pt-4 border-t border-gold/20">
            <Button variant="gold" className="w-full" onClick={onUpgrade}>
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface PremiumFeatureGridProps {
  children: React.ReactNode;
  className?: string;
}

export function PremiumFeatureGrid({ children, className }: PremiumFeatureGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {children}
    </div>
  );
}

interface PremiumBannerProps {
  title?: string;
  description?: string;
  onUpgrade?: () => void;
  className?: string;
}

export function PremiumBanner({
  title = "Unlock Pro Features",
  description = "Get access to advanced features, priority support, and more.",
  onUpgrade,
  className,
}: PremiumBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-gold/30",
        "bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10",
        "shadow-[0_0_20px_hsl(var(--gold)/0.15)]",
        className
      )}
    >
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent animate-shimmer" />
      
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-gold/20 border border-gold/30">
            <Crown className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {onUpgrade && (
          <Button variant="gold" onClick={onUpgrade}>
            Upgrade Now
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
