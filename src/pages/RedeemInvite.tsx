import { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassPanel, GlassPanelContent, GlassPanelHeader, GlassPanelTitle } from '@/components/ui/glass-panel';
import { GlowText } from '@/components/ui/glow-text';
import { HoloBadge } from '@/components/ui/holo-badge';
import { KernelLogo } from '@/components/ui/kernel-logo';
import { useInviteCode } from '@/hooks/useInviteCode';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { 
  Ticket, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

// Lazy load heavy Three.js component
const PageBackground3D = lazy(() => 
  import('@/components/three/PageBackground3D').then(m => ({ default: m.PageBackground3D }))
);

export default function RedeemInvite() {
  const navigate = useNavigate();
  const { validateCode, validating } = useInviteCode();
  const [code, setCode] = useState('');
  const [validated, setValidated] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    type?: string;
    remaining_uses?: number;
    campaign?: string;
  } | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    const result = await validateCode(code);
    
    if (!result.valid) {
      toast.error(result.error || 'Invalid invite code');
      return;
    }

    setValidationResult(result);
    setValidated(true);
    toast.success('Invite code validated!');
  };

  const handleContinue = () => {
    sessionStorage.setItem('invite_code', code.trim().toUpperCase());
    navigate('/auth?mode=signup');
  };

  if (validated && validationResult) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <Suspense fallback={<div className="fixed inset-0 bg-background" />}>
          <PageBackground3D intensity="low" className="fixed inset-0" />
        </Suspense>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />
        
        <SEO
          title="Code Validated | Kernel"
          description="Your invite code has been validated"
          noIndex
        />
        
        <GlassPanel variant="glow" blur="xl" className="relative z-10 max-w-md mx-4 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center animate-pulse">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </div>
          <GlowText as="h1" variant="primary" intensity="high" className="text-2xl font-bold mb-2">
            You're In!
          </GlowText>
          <p className="text-muted-foreground mb-2">
            Your invite code is valid. Continue to create your account.
          </p>
          
          <div className="p-4 bg-card/50 rounded-lg border border-primary/20 mb-6">
            <code className="text-lg font-mono font-bold text-primary">{code.toUpperCase()}</code>
            {validationResult.campaign && (
              <HoloBadge variant="secondary" className="ml-2">
                {validationResult.campaign}
              </HoloBadge>
            )}
          </div>
          
          <Button className="w-full gap-2 min-h-[48px] touch-manipulation active:scale-[0.98] transition-transform" size="lg" onClick={handleContinue}>
            Create Account
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-4">
            The code will be redeemed when you complete signup
          </p>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={<div className="fixed inset-0 bg-background" />}>
        <PageBackground3D intensity="low" className="fixed inset-0" />
      </Suspense>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />
      
      <SEO
        title="Enter Invite Code | Kernel"
        description="Enter your invite code to access Kernel"
        noIndex
      />

      <div className="relative z-10 w-full max-w-md space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center">
            <KernelLogo size="xl" glow />
          </div>
          <div className="flex items-center justify-center gap-2">
            <GlowText as="h1" variant="gradient" intensity="medium" className="text-2xl sm:text-3xl font-bold">
              Enter Invite Code
            </GlowText>
            <HoloBadge variant="glow">Beta</HoloBadge>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Kernel is currently invite-only. Enter your code below to get started.
          </p>
        </div>

        {/* Form Card */}
        <GlassPanel variant="glow" blur="xl" scanLine>
          <GlassPanelHeader>
            <GlassPanelTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Invite Code
            </GlassPanelTitle>
          </GlassPanelHeader>
          <GlassPanelContent>
            <form onSubmit={handleValidate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="sr-only">Invite Code</Label>
                <Input
                  id="code"
                  placeholder="KERNEL-XXXX-XXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-mono text-center text-base sm:text-lg tracking-wider bg-background/50 h-12 touch-manipulation"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full gap-2 min-h-[48px] touch-manipulation active:scale-[0.98] transition-transform" size="lg" disabled={validating}>
                {validating ? (
                  <>
                    <LoadingSpinner />
                    Validating...
                  </>
                ) : (
                  <>
                    Validate Code
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </GlassPanelContent>
        </GlassPanel>

        {/* Footer */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Don't have a code?
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full gap-2 min-h-[44px] touch-manipulation active:scale-[0.98] transition-transform" asChild>
              <Link to="/request-invite">
                <Sparkles className="h-4 w-4" />
                Request Early Access
              </Link>
            </Button>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Or follow us on{' '}
              <a 
                href="https://x.com/kernel" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                X <ExternalLink className="h-3 w-3" />
              </a>
              {' '}for invite code giveaways
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2 min-h-[44px] touch-manipulation active:scale-[0.98] transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
