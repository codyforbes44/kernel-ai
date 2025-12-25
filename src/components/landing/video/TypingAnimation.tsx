import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TypingAnimationProps {
  text: string;
  isActive: boolean;
  typingSpeed?: number;
  className?: string;
}

export function TypingAnimation({ 
  text, 
  isActive, 
  typingSpeed = 50,
  className 
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText("");
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [isActive, text, typingSpeed]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className={className}>
      <span className="text-foreground">{displayedText}</span>
      <motion.span
        animate={{ opacity: showCursor ? 1 : 0 }}
        className="inline-block w-0.5 h-[1.1em] bg-primary ml-0.5 align-middle"
      />
    </div>
  );
}
