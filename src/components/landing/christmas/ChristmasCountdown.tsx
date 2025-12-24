import { useState, useEffect, useMemo } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Festive countdown timer to Christmas Day.
 * Shows days, hours, minutes, and seconds remaining.
 */
export function ChristmasCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isChristmas, setIsChristmas] = useState(false);

  // Calculate Christmas date for current or next year
  const christmasDate = useMemo(() => {
    const now = new Date();
    const year = now.getMonth() === 11 && now.getDate() > 25 
      ? now.getFullYear() + 1 
      : now.getFullYear();
    return new Date(year, 11, 25, 0, 0, 0); // December 25th at midnight
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = christmasDate.getTime() - now.getTime();

      if (difference <= 0) {
        // It's Christmas Day!
        setIsChristmas(true);
        setTimeLeft(null);
        return;
      }

      setIsChristmas(false);
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [christmasDate]);

  if (isChristmas) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium">
        <span className="animate-pulse">🎅</span>
        <span>Merry Christmas!</span>
        <span className="animate-pulse">🎁</span>
      </span>
    );
  }

  if (!timeLeft) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium tabular-nums">
      <span className="opacity-70 hidden sm:inline">Christmas in</span>
      <span className="inline-flex items-center gap-0.5">
        <TimeUnit value={timeLeft.days} label="d" />
        <span className="opacity-50">:</span>
        <TimeUnit value={timeLeft.hours} label="h" />
        <span className="opacity-50 hidden xs:inline">:</span>
        <span className="hidden xs:inline-flex items-baseline">
          <TimeUnit value={timeLeft.minutes} label="m" />
        </span>
        <span className="opacity-50 hidden sm:inline">:</span>
        <span className="hidden sm:inline-flex items-baseline">
          <TimeUnit value={timeLeft.seconds} label="s" />
        </span>
      </span>
    </span>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-baseline">
      <span className="font-semibold">{value.toString().padStart(2, '0')}</span>
      <span className="text-[10px] opacity-70">{label}</span>
    </span>
  );
}
