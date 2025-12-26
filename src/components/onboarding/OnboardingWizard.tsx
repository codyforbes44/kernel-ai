import { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { KernelLogo } from '@/components/ui/kernel-logo';
import { GlassPanel, GlassPanelContent, GlassPanelHeader } from '@/components/ui/glass-panel';
import { GlowText } from '@/components/ui/glow-text';
import { Sparkles, User, Palette, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Lazy load heavy Three.js component
const PageBackground3D = lazy(() => 
  import('@/components/three/PageBackground3D').then(m => ({ default: m.PageBackground3D }))
);

interface OnboardingData {
  displayName: string;
  theme: 'dark' | 'light';
}

interface OnboardingWizardProps {
  initialDisplayName?: string;
  onComplete: (data: OnboardingData) => Promise<void>;
  isSubmitting?: boolean;
}

const steps = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'profile', title: 'Profile', icon: User },
  { id: 'theme', title: 'Theme', icon: Palette },
  { id: 'complete', title: 'Complete', icon: CheckCircle2 },
];

export function OnboardingWizard({ initialDisplayName = '', onComplete, isSubmitting = false }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    displayName: initialDisplayName,
    theme: 'dark',
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    await onComplete(data);
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'profile':
        return data.displayName.trim().length >= 2;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* 2100-era 3D background - lazy loaded */}
      <Suspense fallback={<div className="fixed inset-0 bg-background" />}>
        <PageBackground3D intensity="low" />
      </Suspense>
      
      <GlassPanel variant="glow" blur="lg" className="w-full max-w-lg relative z-10">
        <GlassPanelHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <KernelLogo className="w-12 h-12" />
          </div>
          <Progress value={progress} className="h-1 mb-4" />
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-all",
                    index === currentStep
                      ? "bg-primary text-primary-foreground scale-110 shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
                      : index < currentStep
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
              );
            })}
          </div>
        </GlassPanelHeader>
        <GlassPanelContent className="pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {steps[currentStep].id === 'welcome' && (
                <WelcomeStep />
              )}
              {steps[currentStep].id === 'profile' && (
                <ProfileStep
                  displayName={data.displayName}
                  onChange={(displayName) => setData(prev => ({ ...prev, displayName }))}
                />
              )}
              {steps[currentStep].id === 'theme' && (
                <ThemeStep
                  theme={data.theme}
                  onChange={(theme) => setData(prev => ({ ...prev, theme }))}
                />
              )}
              {steps[currentStep].id === 'complete' && (
                <CompleteStep displayName={data.displayName} />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={cn(currentStep === 0 && "invisible")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={isSubmitting}>
                {isSubmitting ? 'Setting up...' : 'Get Started'}
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </GlassPanelContent>
      </GlassPanel>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="text-center space-y-4">
      <GlowText as="h2" variant="gradient" intensity="medium" className="text-2xl font-bold">
        Welcome to Kernel
      </GlowText>
      <p className="text-base text-muted-foreground">
        Your AI-powered workspace for building amazing applications. 
        Let's set up your profile in just a few steps.
      </p>
      <div className="py-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-6xl"
        >
          🚀
        </motion.div>
      </div>
    </div>
  );
}

function ProfileStep({ 
  displayName, 
  onChange 
}: { 
  displayName: string; 
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <GlowText as="h3" variant="primary" intensity="low" className="text-xl font-semibold mb-1">
          What should we call you?
        </GlowText>
        <p className="text-muted-foreground text-sm">
          This name will be visible in your profile
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your name"
          className="text-center text-lg h-12"
          autoFocus
        />
        {displayName.trim().length > 0 && displayName.trim().length < 2 && (
          <p className="text-sm text-destructive text-center">
            Name must be at least 2 characters
          </p>
        )}
      </div>
    </div>
  );
}

function ThemeStep({ 
  theme, 
  onChange 
}: { 
  theme: 'dark' | 'light'; 
  onChange: (value: 'dark' | 'light') => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <GlowText as="h3" variant="primary" intensity="low" className="text-xl font-semibold mb-1">
          Choose your theme
        </GlowText>
        <p className="text-muted-foreground text-sm">
          You can always change this later in settings
        </p>
      </div>
      <RadioGroup
        value={theme}
        onValueChange={(value) => onChange(value as 'dark' | 'light')}
        className="grid grid-cols-2 gap-4"
      >
        <Label
          htmlFor="dark"
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all",
            theme === 'dark'
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50"
          )}
        >
          <RadioGroupItem value="dark" id="dark" className="sr-only" />
          <div className="w-16 h-10 rounded bg-slate-900 border border-slate-700 mb-2 flex items-center justify-center">
            <span className="text-xs text-slate-400">Aa</span>
          </div>
          <span className="font-medium">Dark</span>
        </Label>
        <Label
          htmlFor="light"
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all",
            theme === 'light'
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50"
          )}
        >
          <RadioGroupItem value="light" id="light" className="sr-only" />
          <div className="w-16 h-10 rounded bg-white border border-slate-200 mb-2 flex items-center justify-center">
            <span className="text-xs text-slate-600">Aa</span>
          </div>
          <span className="font-medium">Light</span>
        </Label>
      </RadioGroup>
    </div>
  );
}

function CompleteStep({ displayName }: { displayName: string }) {
  return (
    <div className="text-center space-y-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto shadow-[0_0_20px_hsl(var(--success)/0.3)]"
      >
        <CheckCircle2 className="w-8 h-8 text-success" />
      </motion.div>
      <GlowText as="h3" variant="primary" intensity="medium" className="text-xl font-semibold">
        You're all set, {displayName}!
      </GlowText>
      <p className="text-base text-muted-foreground">
        Your workspace is ready. Start building something amazing with AI assistance.
      </p>
      <div className="py-4 space-y-2 text-sm text-muted-foreground">
        <p>✨ Access the AI chat for coding help</p>
        <p>🛠️ Build projects with the visual editor</p>
        <p>📝 Use templates to speed up development</p>
      </div>
    </div>
  );
}
