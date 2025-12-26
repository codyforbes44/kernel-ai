import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlowBadge } from '@/components/ui/glow-badge';
import { GlowText } from '@/components/ui/glow-text';
import { HeroEntranceGroup, HeroEntranceItem } from '@/components/landing/HeroEntrance';
import { KernelCoreAnimation } from '@/components/brand/KernelCoreAnimation';
import { KernelAILogo } from '@/components/brand/KernelAILogo';
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
      className={cn("relative z-10 container mx-auto text-center max-w-4xl px-4 sm:px-6", className)}
    >
      {/* Centerpiece: Core Animation + Kernel AI Logo - Mobile First Responsive */}
      <HeroEntranceItem className="mb-6 sm:mb-8 md:mb-10">
        <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5">
          {/* Mobile: Compact animation without nodes */}
          <div className="block sm:hidden">
            <KernelCoreAnimation 
              size="sm" 
              showNodes={false}
              isPaused={prefersReducedMotion}
            />
          </div>
          
          {/* Tablet: Medium animation with nodes */}
          <div className="hidden sm:block lg:hidden">
            <KernelCoreAnimation 
              size="lg" 
              showNodes={true}
              isPaused={prefersReducedMotion}
            />
          </div>
          
          {/* Desktop: Full animation with nodes */}
          <div className="hidden lg:block">
            <KernelCoreAnimation 
              size="xl" 
              showNodes={true}
              isPaused={prefersReducedMotion}
            />
          </div>
          
          {/* Kernel AI Text Logo - Responsive sizing */}
          <div className="block sm:hidden">
            <KernelAILogo size="md" isPaused={prefersReducedMotion} />
          </div>
          <div className="hidden sm:block lg:hidden">
            <KernelAILogo size="lg" isPaused={prefersReducedMotion} />
          </div>
          <div className="hidden lg:block">
            <KernelAILogo size="xl" isPaused={prefersReducedMotion} />
          </div>
        </div>
      </HeroEntranceItem>

      {/* Badge */}
      <HeroEntranceItem>
        <GlowBadge 
          variant="glow" 
          size="lg"
          icon={<Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          className="mb-3 sm:mb-4 md:mb-5"
        >
          <span className="text-xs sm:text-sm">The Core That Powers Your Vision</span>
        </GlowBadge>
      </HeroEntranceItem>
      
      {/* Headline - Mobile-first responsive sizing */}
      <HeroEntranceItem>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-3 sm:mb-4 md:mb-5 leading-[1.15] sm:leading-tight">
          <GlowText variant="gradient">
            Your AI Development OS
          </GlowText>
          <br />
          <span className="text-primary drop-shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
            One Core. Everything Powered.
          </span>
        </h1>
      </HeroEntranceItem>
      
      {/* Description - Better mobile readability */}
      <HeroEntranceItem>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground/80 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
          Kernel is the operating system for modern development. AI, databases, UI, APIs, 
          auth, and deployment — all powered by one intelligent core. From idea to production in minutes.
        </p>
      </HeroEntranceItem>
      
      {/* CTA Buttons - Mobile-first with proper touch targets */}
      <HeroEntranceItem className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button 
            variant="gold" 
            size="lg" 
            className="w-full sm:w-auto sm:min-w-[180px] h-12 sm:h-11 text-sm sm:text-base font-medium shadow-lg shadow-gold/20 active:scale-[0.98] transition-transform touch-manipulation" 
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
            className="w-full sm:w-auto sm:min-w-[180px] h-12 sm:h-11 text-sm sm:text-base font-medium active:scale-[0.98] transition-transform touch-manipulation" 
            asChild
          >
            <Link to="/redeem-invite">
              Enter Invite Code
            </Link>
          </Button>
        </div>
        
        {/* Trust indicator */}
        <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-3 sm:mt-4 tracking-wide">
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
        "flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group",
        className
      )}
      aria-label="Scroll to features"
    >
      <span className="text-[10px] sm:text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Scroll
      </span>
      <ChevronDown className={cn("h-4 w-4 sm:h-5 sm:w-5", !prefersReducedMotion && "animate-bounce")} />
    </a>
  );
}
