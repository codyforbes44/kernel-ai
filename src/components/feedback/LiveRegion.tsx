import { useEffect, useState, useRef } from "react";

interface LiveRegionProps {
  message: string;
  /** polite (default) or assertive */
  politeness?: "polite" | "assertive";
  /** Clear the message after this many milliseconds. 0 = don't clear */
  clearAfter?: number;
}

/**
 * Announces messages to screen readers via ARIA live regions
 */
export function LiveRegion({ 
  message, 
  politeness = "polite",
  clearAfter = 5000 
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (message) {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set the new message
      setCurrentMessage(message);
      
      // Optionally clear after delay
      if (clearAfter > 0) {
        timeoutRef.current = setTimeout(() => {
          setCurrentMessage("");
        }, clearAfter);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  );
}

/**
 * Hook for managing live region announcements
 */
export function useLiveAnnouncer() {
  const [message, setMessage] = useState("");

  const announce = (text: string) => {
    // Force re-announcement by clearing first
    setMessage("");
    requestAnimationFrame(() => {
      setMessage(text);
    });
  };

  return { message, announce };
}
