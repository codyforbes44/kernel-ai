import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Command as CommandIcon } from "lucide-react";
import { XLogo } from "@/components/ui/x-logo";
import { Button } from "@/components/ui/button";
import { KernelLogoAnimated } from "@/components/ui/kernel-logo-animated";
import { CommandNav } from "@/components/layout/CommandNav";
import { useCommandNav } from "@/hooks/useCommandNav";
import { hapticFeedback } from "@/hooks/useHaptic";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [scrollY, setScrollY] = useState(0);
  const { isOpen: commandOpen, toggle: toggleCommand, close: closeCommand } = useCommandNav();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate scroll-based styles
  const scrolled = scrollY > 20;
  
  // Progressive blur that intensifies as you scroll (max at 100px)
  const blurAmount = useMemo(() => {
    const progress = Math.min(scrollY / 100, 1);
    return Math.round(8 + progress * 12); // 8px to 20px blur
  }, [scrollY]);

  const handleCommandClick = () => {
    hapticFeedback("light");
    toggleCommand();
  };

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          "border-b safe-area-top",
          scrolled 
            ? "border-border/60 shadow-lg shadow-background/50" 
            : "border-transparent"
        )}
        style={{
          backdropFilter: `blur(${blurAmount}px)`,
          WebkitBackdropFilter: `blur(${blurAmount}px)`,
          backgroundColor: scrolled 
            ? `hsl(var(--background) / ${Math.min(0.85 + scrollY / 500, 0.95)})`
            : 'transparent',
        }}
      >
        {/* Holographic accent line - intensifies on scroll */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-opacity duration-300"
          style={{ opacity: scrolled ? 0.8 : 0.4 }}
        />
        
        {/* Mobile-optimized: reduced height (48px vs 56px) */}
        <div className="container mx-auto px-4 h-12 sm:h-14 md:h-16 flex items-center justify-between">
          {/* Logo - Opens Command Nav */}
          <KernelLogoAnimated
            size="md"
            variant="animated"
            isActive={commandOpen}
            onClick={handleCommandClick}
            className="cursor-pointer touch-manipulation active:scale-95 transition-transform"
          />

          {/* Desktop Navigation - Minimal with Command Trigger */}
          <nav className="hidden md:flex items-center gap-2">
            {/* Command trigger button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCommandClick}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <CommandIcon className="h-4 w-4" />
              <span className="text-sm">Menu</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/30 px-1.5 font-mono text-[10px] text-muted-foreground sm:flex">
                ⌘K
              </kbd>
            </Button>

            <div className="w-px h-6 bg-border/50 mx-2" />

            {/* Quick action links */}
            <a
              href="https://x.com/kernel_cool"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
              aria-label="Follow on X"
            >
              <XLogo className="h-4 w-4" />
            </a>

            <Button variant="outline" size="sm" className="border-border/60 hover:border-primary/40 hover:bg-primary/5" asChild>
              <Link to="/redeem-invite">Have a Code?</Link>
            </Button>

            <Button variant="gold" size="sm" className="shadow-sm shadow-gold/20" asChild>
              <Link to="/request-invite">Request Access</Link>
            </Button>
          </nav>

          {/* Mobile Navigation - Larger touch targets */}
          <div className="flex md:hidden items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCommandClick}
              className="text-muted-foreground h-10 w-10 touch-manipulation active:scale-90 transition-transform"
              aria-label="Open menu"
            >
              <CommandIcon className="h-5 w-5" />
            </Button>
            
            {/* More prominent CTA with pulse effect */}
            <Button 
              variant="gold" 
              size="sm" 
              className="shadow-sm shadow-gold/20 touch-manipulation active:scale-95 transition-transform h-9 px-3 text-sm font-medium" 
              asChild
            >
              <Link to="/request-invite">Get Access</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Command Navigation Modal */}
      <CommandNav isOpen={commandOpen} onClose={closeCommand} />
    </>
  );
}
