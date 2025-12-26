import { ReactNode, lazy, Suspense } from "react";
import { GlassPanel, GlassPanelContent, GlassPanelHeader } from "@/components/ui/glass-panel";
import { GlowText } from "@/components/ui/glow-text";
import { KernelLogoAnimated } from "@/components/ui/kernel-logo-animated";
import { cn } from "@/lib/utils";

// Lazy load heavy Three.js component
const PageBackground3D = lazy(() => 
  import("@/components/three/PageBackground3D").then(m => ({ default: m.PageBackground3D }))
);

interface AuthCardProps {
  children: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function AuthCard({ children, title, description, className }: AuthCardProps) {
  return (
    <div className={cn(
      "relative min-h-screen min-h-[100dvh] w-full flex items-center justify-center",
      "px-4 py-6 sm:px-6 sm:py-8 pb-safe pt-safe",
      "overflow-y-auto",
      className
    )}>
      {/* 3D Background - lazy loaded */}
      <Suspense fallback={
        <div className="fixed inset-0 bg-background" aria-hidden="true" />
      }>
        <PageBackground3D intensity="low" className="fixed inset-0" />
      </Suspense>
      
      {/* Radial gradient overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />
      
      <div className="relative z-10 w-full max-w-[calc(100vw-2rem)] sm:max-w-md space-y-6 sm:space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex">
            <KernelLogoAnimated size="lg" variant="animated" className="sm:hidden" />
            <KernelLogoAnimated size="xl" variant="animated" className="hidden sm:block" />
          </div>
          <GlowText as="h1" variant="primary" intensity="medium" className="text-xl sm:text-2xl font-bold tracking-tight">
            Kernel
          </GlowText>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Your AI-powered development companion
          </p>
        </div>

        <GlassPanel variant="glow" blur="xl" scanLine>
          <GlassPanelHeader className="space-y-1 px-4 sm:px-6 pb-3 sm:pb-4">
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </GlassPanelHeader>
          <GlassPanelContent className="px-4 sm:px-6">{children}</GlassPanelContent>
        </GlassPanel>

        <p className="text-center text-xs text-muted-foreground">
          Built for developers who ship fast
        </p>
      </div>
    </div>
  );
}
