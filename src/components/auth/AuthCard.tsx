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
      "min-h-screen w-full flex items-center justify-center bg-background",
      "p-4 pb-safe pt-safe",
      className
    )}>
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex">
            <KernelLogo size="xl" className="border border-primary/20" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kernel</h1>
          <p className="text-muted-foreground text-sm">
            Your AI-powered development companion
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Built for developers who ship fast
        </p>
      </div>
    </div>
  );
}
