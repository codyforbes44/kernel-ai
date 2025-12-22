import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface KernelLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
}

const sizeClasses = {
  sm: "text-sm w-6 h-6",
  md: "text-base w-8 h-8",
  lg: "text-lg w-10 h-10",
  xl: "text-xl w-12 h-12",
};

export const KernelLogo = forwardRef<HTMLDivElement, KernelLogoProps>(
  ({ size = "md", className, glow = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary/15 font-mono font-bold text-primary border border-primary/30 transition-all duration-300",
          glow && "shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.6)]",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {">_"}
      </div>
    );
  }
);

KernelLogo.displayName = "KernelLogo";
