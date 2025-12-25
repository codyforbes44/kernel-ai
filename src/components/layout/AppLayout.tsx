import * as React from 'react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Whether to show the subtle 2100-era depth background */
  showDepthBackground?: boolean;
}

/**
 * AppLayout - A consistent layout wrapper for protected app pages
 * Provides subtle 2100-era depth perception without heavy WebGL effects
 */
export function AppLayout({ 
  children, 
  className,
  showDepthBackground = true 
}: AppLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background relative', className)}>
      {/* Subtle 2100-era depth background */}
      {showDepthBackground && (
        <div 
          className="fixed inset-0 -z-10 pointer-events-none"
          aria-hidden="true"
        >
          {/* Primary radial glow from top */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.08) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 80% 100%, hsl(var(--primary) / 0.05) 0%, transparent 40%),
                radial-gradient(ellipse 40% 30% at 10% 80%, hsl(var(--accent) / 0.04) 0%, transparent 35%)
              `,
            }}
          />
          
          {/* Subtle grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          
          {/* Vignette effect for depth */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, transparent 0%, hsl(var(--background) / 0.3) 100%)',
            }}
          />
        </div>
      )}
      
      {/* Content */}
      {children}
    </div>
  );
}
