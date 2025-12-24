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
      <div className={cn("relative mx-auto overflow-hidden flex flex-col", className)}>
        {/* iPad-style frame - reduced bezels */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-[1.5rem] -m-2 shadow-xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-600 to-zinc-700 rounded-[1.3rem] -m-1" />
        {/* Camera notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 w-1.5 h-1.5 bg-zinc-900 rounded-full z-10 shadow-inner" />
        {/* Screen */}
        <div className="relative bg-background rounded-lg overflow-hidden shadow-inner flex-1 w-full">
          {children}
        </div>
        {/* Home button area indicator */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-0.5 w-6 h-0.5 bg-zinc-600 rounded-full" />
      </div>
    );
  }

  // Mobile (iPhone-style frame) - reduced bezels
  return (
    <div className={cn("relative mx-auto overflow-hidden flex flex-col", className)}>
      {/* Outer phone frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-700 to-zinc-900 rounded-[1.5rem] -m-2 shadow-2xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded-[1.3rem] -m-1" />
      {/* Dynamic Island / Notch - smaller */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-zinc-900 rounded-full z-10 flex items-center justify-center gap-1">
        <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
        <div className="w-5 h-1 bg-zinc-700 rounded-full" />
      </div>
      {/* Side buttons - smaller */}
      <div className="absolute -left-2.5 top-20 w-0.5 h-6 bg-zinc-700 rounded-l" />
      <div className="absolute -left-2.5 top-28 w-0.5 h-8 bg-zinc-700 rounded-l" />
      <div className="absolute -left-2.5 top-40 w-0.5 h-8 bg-zinc-700 rounded-l" />
      <div className="absolute -right-2.5 top-28 w-0.5 h-12 bg-zinc-700 rounded-r" />
      {/* Screen with rounded corners */}
      <div className="relative bg-background rounded-xl overflow-x-hidden overflow-y-auto shadow-inner flex-1 w-full">
        {children}
      </div>
      {/* Home indicator */}
      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-foreground/20 rounded-full" />
    </div>
  );
}
