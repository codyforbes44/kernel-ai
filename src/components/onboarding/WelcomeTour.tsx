import { useState, useEffect, useCallback, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, Sparkles, MessageSquare, Layers, Command, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, getTimeOfDayGreeting } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string; // CSS selector for highlighting
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const getTourSteps = (): TourStep[] => [
  {
    id: 'welcome',
    title: `${getTimeOfDayGreeting()}! Welcome to Your AI Workspace`,
    description: 'This is your personal hub for AI-powered conversations, templates, and building apps. Let me show you around!',
    icon: <Sparkles className="h-6 w-6" />,
    position: 'center',
  },
  {
    id: 'conversations',
    title: 'Organize Your Conversations',
    description: 'Your sidebar keeps all conversations organized by project. Pin important chats, archive old ones, and find anything with quick search.',
    icon: <MessageSquare className="h-6 w-6" />,
    position: 'center',
  },
  {
    id: 'templates',
    title: 'Use Templates for Speed',
    description: 'Type "/" in the chat to access pre-built templates for debugging, components, databases, and more. They save time on common tasks!',
    icon: <Layers className="h-6 w-6" />,
    position: 'center',
  },
  {
    id: 'command-palette',
    title: 'Command Palette (⌘K)',
    description: 'Press ⌘K (or Ctrl+K) to open the command palette. Quickly search conversations, switch models, and access features without leaving your keyboard.',
    icon: <Command className="h-6 w-6" />,
    position: 'center',
  },
  {
    id: 'builder',
    title: 'Build Full Apps',
    description: 'Head to the Builder to create complete web applications with AI assistance. Write code, preview live, and iterate in real-time.',
    icon: <Zap className="h-6 w-6" />,
    position: 'center',
  },
];

interface WelcomeTourProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const WelcomeTour = forwardRef<HTMLDivElement, WelcomeTourProps>(
  function WelcomeTour({ onComplete, forceShow = false }, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      setHasChecked(true);
      return;
    }

    // Check if user has completed the tour
    const checkTourStatus = async () => {
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
        const hasCompletedTour = preferences?.hasCompletedTour === true;
        
        if (!hasCompletedTour) {
          // Small delay to let the app render first
          setTimeout(() => setIsOpen(true), 500);
        }
      } catch (error) {
        console.error('Error checking tour status:', error);
      } finally {
        setHasChecked(true);
      }
    };

    checkTourStatus();
  }, [user, forceShow]);

  const markTourComplete = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      const currentPreferences = (data?.preferences as Record<string, unknown>) || {};
      
      await supabase
        .from('profiles')
        .update({
          preferences: {
            ...currentPreferences,
            hasCompletedTour: true,
          },
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error marking tour complete:', error);
    }
  }, [user]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    markTourComplete();
    onComplete?.();
  }, [markTourComplete, onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  }, [currentStep, handleClose]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    handleClose();
  }, [handleClose]);

  if (!hasChecked || !isOpen) return null;

  const tourSteps = getTourSteps();
  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return createPortal(
    <div 
      ref={ref}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-300"
        onClick={handleSkip}
        aria-hidden="true"
      />
      
      {/* Tour Card */}
      <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 fade-in-0 slide-in-from-bottom-4 duration-300">
        <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
              aria-label="Skip tour"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
              {step.icon}
            </div>
            
            <h2 id="tour-title" className="text-xl font-semibold text-foreground mb-2">
              {step.title}
            </h2>
            
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Step indicators */}
          <nav className="flex justify-center gap-1.5 pb-4" aria-label="Tour steps">
            {tourSteps.map((s, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-200",
                  index === currentStep 
                    ? "w-6 bg-primary" 
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to step ${index + 1}: ${s.title}`}
                aria-current={index === currentStep ? "step" : undefined}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
            <Button
              variant="ghost"
              onClick={isFirstStep ? handleSkip : handlePrev}
              className="gap-1"
            >
              {isFirstStep ? (
                'Skip'
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </>
              )}
            </Button>
            
            <Button onClick={handleNext} className="gap-1">
              {isLastStep ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
});
