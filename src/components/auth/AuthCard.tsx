import { ReactNode } from "react";
import { GlassPanel, GlassPanelContent, GlassPanelHeader } from "@/components/ui/glass-panel";
import { GlowText } from "@/components/ui/glow-text";
import { KernelLogo } from "@/components/ui/kernel-logo";
import { PageBackground3D } from "@/components/three/PageBackground3D";
import { cn } from "@/lib/utils";

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
      {/* 3D Background */}
      <PageBackground3D intensity="low" className="fixed inset-0" />
      
      {/* Radial gradient overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />
      
      <div className="relative z-10 w-full max-w-[calc(100vw-2rem)] sm:max-w-md space-y-6 sm:space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex">
            <KernelLogo size="lg" glow className="sm:hidden border border-primary/20" />
            <KernelLogo size="xl" glow className="hidden sm:block border border-primary/20" />
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
