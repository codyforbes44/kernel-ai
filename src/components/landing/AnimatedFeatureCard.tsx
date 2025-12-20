import { FeatureCard, type FeatureCardProps } from "@/components/ui/feature-card";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";

interface AnimatedFeatureCardProps extends FeatureCardProps {
  delay?: number;
}

export function AnimatedFeatureCard({ 
  delay = 0, 
  className,
  ...props 
}: AnimatedFeatureCardProps) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isIntersecting 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <FeatureCard className={className} {...props} />
    </div>
  );
}
