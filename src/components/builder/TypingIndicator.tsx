import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TypingUser {
  id: string;
  displayName: string;
  color: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  className?: string;
}

export function TypingIndicator({ typingUsers, className }: TypingIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typingUsers.length > 0) {
      setVisible(true);
    } else {
      // Fade out after a small delay for smooth UX
      const timeout = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [typingUsers.length]);

  if (!visible || typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].displayName} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing`;
    } else {
      return `${typingUsers[0].displayName} and ${typingUsers.length - 1} others are typing`;
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md animate-in fade-in slide-in-from-bottom-1 duration-200',
        className
      )}
    >
      <div className="flex items-center gap-1">
        {typingUsers.slice(0, 3).map((user, index) => (
          <div
            key={user.id}
            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
            style={{ 
              backgroundColor: user.color,
              marginLeft: index > 0 ? '-4px' : 0,
              zIndex: 3 - index,
            }}
          >
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      <span>{getTypingText()}</span>
      <div className="flex gap-0.5">
        <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
