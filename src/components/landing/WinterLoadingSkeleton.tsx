import { memo } from 'react';

/**
 * Winter-themed loading skeleton with frosted glass effects
 * and icy shimmer animations matching the Christmas aesthetic
 */
export const WinterLoadingSkeleton = memo(function WinterLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated aurora background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(ellipse, rgba(56, 189, 248, 0.3) 0%, transparent 70%)',
            animation: 'auroraFloat 8s ease-in-out infinite',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute top-20 right-1/4 w-80 h-80 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(ellipse, rgba(147, 197, 253, 0.3) 0%, transparent 70%)',
            animation: 'auroraFloat 10s ease-in-out infinite reverse',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Floating snowflake particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${(i * 8.5) % 100}%`,
              animation: `snowfallSmooth ${10 + (i % 4) * 2}s linear infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Navigation skeleton */}
        <nav className="flex items-center justify-between mb-16">
          <SkeletonBox className="w-32 h-8" />
          <div className="hidden md:flex items-center gap-6">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBox key={i} className="w-20 h-4" delay={i * 100} />
            ))}
          </div>
          <SkeletonBox className="w-24 h-10 rounded-full" />
        </nav>

        {/* Hero section skeleton */}
        <div className="flex flex-col items-center text-center mt-12 mb-20">
          {/* Holiday badge */}
          <SkeletonBox className="w-40 h-6 rounded-full mb-6" delay={200} />
          
          {/* Main headline */}
          <SkeletonBox className="w-3/4 max-w-2xl h-12 md:h-16 mb-4" delay={300} />
          <SkeletonBox className="w-2/3 max-w-xl h-12 md:h-16 mb-6" delay={400} />
          
          {/* Subheadline */}
          <SkeletonBox className="w-full max-w-lg h-5 mb-2" delay={500} />
          <SkeletonBox className="w-4/5 max-w-md h-5 mb-8" delay={600} />
          
          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SkeletonBox className="w-40 h-12 rounded-full" delay={700} />
            <SkeletonBox className="w-36 h-12 rounded-full" delay={800} />
          </div>
        </div>

        {/* Features grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <FeatureCardSkeleton key={i} delay={800 + i * 100} />
          ))}
        </div>

        {/* Testimonial/Social proof skeleton */}
        <div className="flex flex-col items-center mb-16">
          <SkeletonBox className="w-48 h-6 mb-8" delay={1400} />
          <div className="flex gap-8 flex-wrap justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonBox 
                key={i} 
                className="w-24 h-8 rounded" 
                delay={1500 + i * 100} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes winterShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes auroraFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) scale(1.1);
            opacity: 0.3;
          }
        }
        
        @keyframes frostPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
});

interface SkeletonBoxProps {
  className?: string;
  delay?: number;
}

/**
 * Individual skeleton box with frosted glass effect and icy shimmer
 */
const SkeletonBox = memo(function SkeletonBox({ className = '', delay = 0 }: SkeletonBoxProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.15) 0%, rgba(203, 213, 225, 0.1) 50%, rgba(148, 163, 184, 0.15) 100%)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)',
        animation: `frostPulse 2s ease-in-out infinite`,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Icy shimmer effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'winterShimmer 2.5s ease-in-out infinite',
          animationDelay: `${delay}ms`,
        }}
      />
      
      {/* Frost crystal overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                           radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                           radial-gradient(circle at 50% 50%, rgba(200, 220, 255, 0.05) 2px, transparent 2px)`,
          backgroundSize: '30px 30px, 25px 25px, 40px 40px',
        }}
      />
    </div>
  );
});

interface FeatureCardSkeletonProps {
  delay?: number;
}

/**
 * Feature card skeleton with winter aesthetic
 */
const FeatureCardSkeleton = memo(function FeatureCardSkeleton({ delay = 0 }: FeatureCardSkeletonProps) {
  return (
    <div
      className="relative p-6 rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        animation: `frostPulse 2.5s ease-in-out infinite`,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Ice crystal corner accent */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(147, 197, 253, 0.5) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />
      
      {/* Icon placeholder */}
      <SkeletonBox className="w-12 h-12 rounded-lg mb-4" delay={delay + 100} />
      
      {/* Title */}
      <SkeletonBox className="w-3/4 h-5 mb-3" delay={delay + 200} />
      
      {/* Description lines */}
      <SkeletonBox className="w-full h-3 mb-2" delay={delay + 300} />
      <SkeletonBox className="w-5/6 h-3 mb-2" delay={delay + 400} />
      <SkeletonBox className="w-2/3 h-3" delay={delay + 500} />
    </div>
  );
});

export default WinterLoadingSkeleton;
