import { cn } from "@/lib/utils";

interface KernelLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "text-sm w-6 h-6",
  md: "text-base w-8 h-8",
  lg: "text-lg w-10 h-10",
  xl: "text-xl w-12 h-12",
};

export function KernelLogo({ size = "md", className }: KernelLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-primary/10 font-mono font-bold text-primary",
        sizeClasses[size],
        className
      )}
    >
      {">_"}
    </div>
  );
}
