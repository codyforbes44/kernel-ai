import { Coins, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CreditsBadgeProps {
  balance: number;
  isLowBalance?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CreditsBadge({ balance, isLowBalance, onClick, className }: CreditsBadgeProps) {
  const formatBalance = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={isLowBalance ? 'destructive' : 'secondary'}
            className={cn(
              'gap-1.5 cursor-pointer transition-colors hover:bg-secondary/80',
              isLowBalance && 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/30',
              className
            )}
            onClick={onClick}
          >
            {isLowBalance ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <Coins className="h-3 w-3" />
            )}
            <span className="font-mono text-xs">{formatBalance(balance)}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p className="font-medium">AI Credits: {balance.toLocaleString()}</p>
          {isLowBalance && (
            <p className="text-destructive">Low balance - click to purchase more</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}