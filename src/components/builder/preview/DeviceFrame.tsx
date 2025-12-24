import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DeviceFrameProps {
  viewport: 'desktop' | 'tablet' | 'mobile';
  children: ReactNode;
  className?: string;
}

export function DeviceFrame({ viewport, children, className }: DeviceFrameProps) {
  if (viewport === 'desktop') {
    return (
      <div className={cn("w-full h-full", className)}>
        {children}
      </div>
    );
  }

  if (viewport === 'tablet') {
    return (
      <div className={cn("relative mx-auto", className)}>
        {/* iPad-style frame */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-[2rem] -m-3 shadow-xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-600 to-zinc-700 rounded-[1.8rem] -m-2" />
        {/* Camera notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-900 rounded-full z-10 shadow-inner" />
        {/* Screen */}
        <div className="relative bg-background rounded-xl overflow-hidden shadow-inner">
          {children}
        </div>
        {/* Home button area indicator */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-1 bg-zinc-600 rounded-full" />
      </div>
    );
  }

  // Mobile (iPhone-style frame)
  return (
    <div className={cn("relative mx-auto", className)}>
      {/* Outer phone frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-700 to-zinc-900 rounded-[2.5rem] -m-3 shadow-2xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded-[2.3rem] -m-2" />
      {/* Dynamic Island / Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 w-24 h-6 bg-zinc-900 rounded-full z-10 flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-zinc-700 rounded-full" />
        <div className="w-8 h-1.5 bg-zinc-700 rounded-full" />
      </div>
      {/* Side buttons */}
      <div className="absolute -left-4 top-24 w-1 h-8 bg-zinc-700 rounded-l" />
      <div className="absolute -left-4 top-36 w-1 h-12 bg-zinc-700 rounded-l" />
      <div className="absolute -left-4 top-52 w-1 h-12 bg-zinc-700 rounded-l" />
      <div className="absolute -right-4 top-32 w-1 h-16 bg-zinc-700 rounded-r" />
      {/* Screen with rounded corners */}
      <div className="relative bg-background rounded-[1.5rem] overflow-hidden shadow-inner">
        {children}
      </div>
      {/* Home indicator */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-foreground/20 rounded-full" />
    </div>
  );
}
