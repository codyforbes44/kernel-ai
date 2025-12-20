import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KernelLogo } from "@/components/ui/kernel-logo";
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
      "min-h-screen min-h-[100dvh] w-full flex items-center justify-center bg-background",
      "px-4 py-6 sm:px-6 sm:py-8 pb-safe pt-safe",
      "overflow-y-auto",
      className
    )}>
      <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md space-y-6 sm:space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex">
            <KernelLogo size="lg" className="sm:hidden border border-primary/20" />
            <KernelLogo size="xl" className="hidden sm:block border border-primary/20" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Kernel</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Your AI-powered development companion
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="space-y-1 px-4 sm:px-6 pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">{children}</CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Built for developers who ship fast
        </p>
      </div>
    </div>
  );
}
