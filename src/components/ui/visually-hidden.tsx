import * as React from "react";

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

/**
 * Visually hides content while keeping it accessible to screen readers
 */
export function VisuallyHidden({ children, ...props }: VisuallyHiddenProps) {
  return (
    <span className="sr-only" {...props}>
      {children}
    </span>
  );
}
