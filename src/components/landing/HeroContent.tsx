import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlowBadge } from '@/components/ui/glow-badge';
import { GlowText } from '@/components/ui/glow-text';
import { HeroEntranceGroup, HeroEntranceItem } from '@/components/landing/HeroEntrance';
import { KernelCoreAnimation } from '@/components/brand/KernelCoreAnimation';
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroContentProps {
  className?: string;
  prefersReducedMotion?: boolean;
}

export function HeroContent({ className, prefersReducedMotion = false }: HeroContentProps) {
  return (
    <HeroEntranceGroup 
      staggerDelay={prefersReducedMotion ? 0 : 0.1}
      className={cn("relative z-10 container mx-auto text-center max-w-4xl", className)}
    >
      {/* Kernel Core Animation - Main Visual Element */}
      <HeroEntranceItem className="mb-6 md:mb-8">
        <div className="flex justify-center">
          <KernelCoreAnimation 
            size="lg" 
            showNodes={true}
            isPaused={prefersReducedMotion}
          />
        </div>
      </HeroEntranceItem>

      {/* Badge */}
      <HeroEntranceItem>
        <GlowBadge 
          variant="glow" 
          size="lg"
          icon={<Sparkles className="h-4 w-4" />}
          className="mb-4 md:mb-6"
        >
          <span className="text-sm sm:text-base">The Core That Powers Your Vision</span>
        </GlowBadge>
      </HeroEntranceItem>
      
      {/* Headline - Clear value proposition */}
      <HeroEntranceItem>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6 leading-tight">
          <GlowText variant="gradient">
            AI-Powered App Development
          </GlowText>
          <br />
          <span className="text-primary drop-shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
            Ship in Minutes, Not Months
          </span>
        </h1>
      </HeroEntranceItem>
      
      {/* Description - Clear and concise */}
      <HeroEntranceItem>
        <p className="text-base sm:text-lg md:text-xl text-foreground/80 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-4 sm:px-2">
          Transform ideas into production-ready apps with AI that understands your vision. 
          No complex setup. Just describe what you want and start building.
        </p>
      </HeroEntranceItem>
      
      {/* CTA Buttons - Consistent sizing */}
      <HeroEntranceItem className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
          <Button 
            variant="gold" 
            size="lg" 
            className="w-full sm:w-auto sm:min-w-[200px] h-12 text-base font-medium shadow-lg shadow-gold/20 active:scale-[0.98] transition-transform touch-manipulation" 
            asChild
          >
            <Link to="/request-invite">
              Get Early Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="gold-outline" 
            className="w-full sm:w-auto sm:min-w-[200px] h-12 text-base font-medium active:scale-[0.98] transition-transform touch-manipulation" 
            asChild
          >
            <Link to="/redeem-invite">
              Enter Invite Code
            </Link>
          </Button>
        </div>
        
        {/* Trust indicator */}
        <p className="text-xs text-muted-foreground/60 mt-4 tracking-wide">
          No credit card required • Free during beta
        </p>
      </HeroEntranceItem>
    </HeroEntranceGroup>
  );
}

interface ScrollIndicatorProps {
  targetId: string;
  className?: string;
  prefersReducedMotion?: boolean;
}

export function ScrollIndicator({ targetId, className, prefersReducedMotion = false }: ScrollIndicatorProps) {
  return (
    <a 
      href={`#${targetId}`}
      className={cn(
        "flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group",
        className
      )}
      aria-label="Scroll to features"
    >
      <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Scroll
      </span>
      <ChevronDown className={cn("h-5 w-5", !prefersReducedMotion && "animate-bounce")} />
    </a>
  );
}
