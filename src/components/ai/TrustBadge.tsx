/**
 * TrustBadge Component
 * 
 * Visual indicator of AI trust commitment that can be displayed
 * across AI interfaces to reassure users of ethical operation.
 */

import { Shield, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { TRUST_PRINCIPLES, TRUST_COMMITMENT_SHORT } from '@/hooks/useTrustVerification';

interface TrustBadgeProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show in compact mode (icon only) */
  compact?: boolean;
  /** Whether to allow expanding to show full principles */
  expandable?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Trust badge component showing AI ethical commitment
 */
export function TrustBadge({ 
  size = 'md', 
  compact = false,
  expandable = false,
  className 
}: TrustBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const badgeContent = (
    <div className={cn(
      'inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-1',
      'border border-primary/20',
      sizeClasses[size],
      className
    )}>
      <Shield size={iconSizes[size]} className="shrink-0" />
      {!compact && (
        <span className="font-medium">Trust Verified</span>
      )}
      {expandable && !compact && (
        isExpanded ? <ChevronUp size={iconSizes[size]} /> : <ChevronDown size={iconSizes[size]} />
      )}
    </div>
  );

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm">{TRUST_COMMITMENT_SHORT}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (expandable) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full">
            {badgeContent}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <TrustPrinciplesCard />
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm">
          <p className="text-sm">{TRUST_COMMITMENT_SHORT}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Full card displaying all trust principles
 */
export function TrustPrinciplesCard({ className }: { className?: string }) {
  return (
    <div className={cn(
      'rounded-lg border bg-card p-4 shadow-sm',
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">AI Trust Covenant</h3>
      </div>
      
      <div className="space-y-3">
        {TRUST_PRINCIPLES.map((principle) => (
          <div key={principle.id} className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">{principle.name}</span>
            </div>
            <p className="text-xs text-muted-foreground pl-5">
              {principle.summary}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4 pt-3 border-t">
        All AI systems operate under this covenant to ensure truthful, 
        helpful, and transparent assistance.
      </p>
    </div>
  );
}

export default TrustBadge;
