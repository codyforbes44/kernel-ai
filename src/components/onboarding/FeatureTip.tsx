import { useState, useEffect, useCallback } from 'react';
import { X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FeatureTipProps {
  id: string;
  title: string;
  description: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
}

export function FeatureTip({
  id,
  title,
  description,
  className,
  position = 'bottom',
  showOnce = true,
}: FeatureTipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!showOnce) {
      setIsVisible(true);
      setHasChecked(true);
      return;
    }

    const checkTipStatus = async () => {
      if (!user) {
        setHasChecked(true);
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();

        const preferences = data?.preferences as Record<string, unknown> | null;
        const dismissedTips = (preferences?.dismissedTips as string[]) || [];
        
        if (!dismissedTips.includes(id)) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking tip status:', error);
      } finally {
        setHasChecked(true);
      }
    };

    checkTipStatus();
  }, [user, id, showOnce]);

  const handleDismiss = useCallback(async () => {
    setIsVisible(false);

    if (!user || !showOnce) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      const currentPreferences = (data?.preferences as Record<string, unknown>) || {};
      const dismissedTips = (currentPreferences.dismissedTips as string[]) || [];
      
      await supabase
        .from('profiles')
        .update({
          preferences: {
            ...currentPreferences,
            dismissedTips: [...dismissedTips, id],
          },
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error dismissing tip:', error);
    }
  }, [user, id, showOnce]);

  if (!hasChecked || !isVisible) return null;

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div
      className={cn(
        "absolute z-50 w-64 p-3 rounded-lg border border-primary/20 bg-primary/5 backdrop-blur-sm shadow-lg animate-in fade-in-0 zoom-in-95 duration-200",
        positionClasses[position],
        className
      )}
      role="tooltip"
    >
      <div className="flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-6 w-6 shrink-0 -mr-1 -mt-1"
          aria-label="Dismiss tip"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
