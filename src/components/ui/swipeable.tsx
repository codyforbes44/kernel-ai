import { useState, useRef, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/hooks/useHaptic";

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

interface SwipeableProps {
  children: ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  threshold?: number;
  className?: string;
}

export function Swipeable({
  children,
  leftAction,
  rightAction,
  threshold = 80,
  className,
}: SwipeableProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Don't interfere with input fields
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
    
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;

    // Determine swipe direction on first significant movement
    if (isHorizontalSwipe.current === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
    }

    // Only handle horizontal swipes
    if (!isHorizontalSwipe.current) return;

    // Prevent vertical scrolling during horizontal swipe
    e.preventDefault();

    // Limit swipe based on available actions
    let newOffset = diffX;
    if (diffX > 0 && !leftAction) newOffset = 0;
    if (diffX < 0 && !rightAction) newOffset = 0;

    // Apply resistance at edges
    const maxOffset = threshold * 1.5;
    if (Math.abs(newOffset) > maxOffset) {
      const overflow = Math.abs(newOffset) - maxOffset;
      newOffset = Math.sign(newOffset) * (maxOffset + overflow * 0.2);
    }

    setOffsetX(newOffset);
  }, [isSwiping, leftAction, rightAction, threshold]);

  const handleTouchEnd = useCallback(() => {
    setIsSwiping(false);
    isHorizontalSwipe.current = null;

    // Trigger action if threshold exceeded
    if (offsetX > threshold && leftAction) {
      hapticFeedback("success");
      leftAction.onClick();
    } else if (offsetX < -threshold && rightAction) {
      hapticFeedback("warning");
      rightAction.onClick();
    }

    // Reset position
    setOffsetX(0);
  }, [offsetX, threshold, leftAction, rightAction]);

  const leftProgress = leftAction ? Math.min(offsetX / threshold, 1) : 0;
  const rightProgress = rightAction ? Math.min(-offsetX / threshold, 1) : 0;

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Left action background */}
      {leftAction && (
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex items-center justify-start pl-4 transition-opacity",
            leftProgress > 0 ? "opacity-100" : "opacity-0"
          )}
          style={{
            width: Math.abs(offsetX),
            backgroundColor: leftProgress >= 1 ? leftAction.color : `${leftAction.color}80`,
          }}
        >
          <div
            className={cn(
              "flex items-center gap-2 text-white transition-transform",
              leftProgress >= 1 && "scale-110"
            )}
          >
            {leftAction.icon}
            {leftProgress >= 1 && (
              <span className="text-xs font-medium">{leftAction.label}</span>
            )}
          </div>
        </div>
      )}

      {/* Right action background */}
      {rightAction && (
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-end pr-4 transition-opacity",
            rightProgress > 0 ? "opacity-100" : "opacity-0"
          )}
          style={{
            width: Math.abs(offsetX),
            backgroundColor: rightProgress >= 1 ? rightAction.color : `${rightAction.color}80`,
          }}
        >
          <div
            className={cn(
              "flex items-center gap-2 text-white transition-transform",
              rightProgress >= 1 && "scale-110"
            )}
          >
            {rightProgress >= 1 && (
              <span className="text-xs font-medium">{rightAction.label}</span>
            )}
            {rightAction.icon}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className="relative bg-sidebar transition-transform"
        style={{
          transform: `translateX(${offsetX}px)`,
          transitionDuration: isSwiping ? "0ms" : "200ms",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
