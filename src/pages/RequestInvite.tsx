import { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GlassPanel, GlassPanelContent, GlassPanelHeader, GlassPanelTitle } from '@/components/ui/glass-panel';
import { HoloSection } from '@/components/ui/holo-section';
import { HoloBadge } from '@/components/ui/holo-badge';
import { GlowText } from '@/components/ui/glow-text';
import { KernelLogo } from '@/components/ui/kernel-logo';
import { useInviteCode } from '@/hooks/useInviteCode';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Users, 
  Zap, 
  Shield,
  Ticket
} from 'lucide-react';

// Lazy load heavy Three.js component
const PageBackground3D = lazy(() => 
  import('@/components/three/PageBackground3D').then(m => ({ default: m.PageBackground3D }))
);

const requestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  use_case: z.string()
    .min(20, 'Please provide more detail (at least 20 characters)')
    .max(2000, 'Use case is too long (max 2000 characters)')
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function RequestInvite() {
  const navigate = useNavigate();
  const { submitRequest, submitting } = useInviteCode();
  const [submitted, setSubmitted] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema)
  });

  const onSubmit = async (data: RequestFormData) => {
    const result = await submitRequest({
      name: data.name,
      email: data.email,
      use_case: data.use_case
    });
    
    if (result.error) {
      toast.error(result.error);
      return;
    }
    
    setSubmitted(true);
    toast.success('Request submitted!');
  };

  const features = [
    { icon: Zap, label: "Build 10x Faster", description: "Go from idea to deployed app in minutes" },
    { icon: Shield, label: "Production Ready", description: "Built-in auth, database, and deployment" },
    { icon: Users, label: "Join the Community", description: "Connect with other builders" },
  ];

  if (submitted) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <Suspense fallback={<div className="fixed inset-0 bg-background" />}>
          <PageBackground3D intensity="low" className="fixed inset-0" />
        </Suspense>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />
        
        <SEOHead
          title="Request Submitted | Kernel"
          description="Your early access request has been submitted"
          noIndex
        />
        
        <GlassPanel variant="glow" blur="xl" className="relative z-10 max-w-md mx-4 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </div>
          <GlowText as="h1" variant="primary" intensity="medium" className="text-2xl font-bold mb-2">
            Request Submitted!
          </GlowText>
          <p className="text-muted-foreground mb-6">
            Thank you for your interest in Kernel. We'll review your application and be in touch if you're selected for early access.
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="outline" asChild className="min-h-[44px] touch-manipulation active:scale-[0.98] transition-transform">
              <a href="https://x.com/kernel" target="_blank" rel="noopener noreferrer">
                Follow on X for updates
              </a>
            </Button>
            <Button variant="ghost" onClick={() => navigate("/")} className="min-h-[44px] touch-manipulation active:scale-[0.98] transition-transform">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Suspense fallback={<div className="fixed inset-0 bg-background" />}>
        <PageBackground3D intensity="low" className="fixed inset-0" />
      </Suspense>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />
      
      <SEOHead
        title="Request Early Access — Join Kernel Beta"
        description="Request an invite to Kernel early access. Be among the first to build production-ready apps with AI-powered development."
        canonical="/request-invite"
        breadcrumbs={[
          { name: 'Home', url: 'https://kernel.cool' },
          { name: 'Request Invite', url: 'https://kernel.cool/request-invite' },
        ]}
      />

      <HoloSection variant="gradient" className="relative z-10 min-h-screen py-6 sm:py-8 px-4">
        {/* Header */}
        <div className="container max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 sm:mb-8 gap-2 text-muted-foreground hover:text-foreground min-h-[44px] touch-manipulation active:scale-[0.98] transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-start">
            {/* Left: Info */}
            <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <KernelLogo size="lg" glow />
                <HoloBadge variant="glow">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Limited Early Access
                </HoloBadge>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <GlowText as="h1" variant="gradient" intensity="medium" className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                  Get Early Access to Kernel
                </GlowText>
                <p className="text-base sm:text-lg text-muted-foreground">
                  We're opening up Kernel to a select group of early adopters. 
                  Tell us about yourself and how you plan to use Kernel.
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {features.map((feature) => (
                  <div 
                    key={feature.label}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-card/30 border border-border/30 backdrop-blur-sm"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">{feature.label}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 sm:p-4 bg-card/30 rounded-lg border border-border/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="h-4 w-4 text-primary" />
                  <span className="font-medium">Have an invite code?</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  If you already have an invite code, you can sign up directly.
                </p>
                <Button variant="outline" size="sm" asChild className="min-h-[40px] touch-manipulation active:scale-[0.98] transition-transform">
                  <Link to="/redeem">
                    Enter Invite Code
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Form */}
            <GlassPanel variant="glow" blur="xl" scanLine>
              <GlassPanelHeader>
                <GlassPanelTitle>Request Access</GlassPanelTitle>
                <p className="text-sm text-muted-foreground">
                  Access is not guaranteed. We review each request individually.
                </p>
              </GlassPanelHeader>
              <GlassPanelContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      {...register('name')}
                      className="bg-background/50"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register('email')}
                      className="bg-background/50"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="use_case">How will you use Kernel?</Label>
                    <Textarea
                      id="use_case"
                      placeholder="Tell us about what you want to build, your experience level, and why you're excited about Kernel..."
                      rows={5}
                      {...register('use_case')}
                      className="bg-background/50 resize-none"
                    />
                    {errors.use_case && (
                      <p className="text-sm text-destructive">{errors.use_case.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Minimum 20 characters. The more detail you provide, the better.
                    </p>
                  </div>

                  <Button type="submit" className="w-full gap-2 min-h-[48px] touch-manipulation active:scale-[0.98] transition-transform" disabled={submitting}>
                    {submitting ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                    By submitting, you agree to our{' '}
                    <Link to="/privacy" className="underline hover:text-primary">
                      Privacy Policy
                    </Link>
                    {' '}and{' '}
                    <Link to="/terms" className="underline hover:text-primary">
                      Terms of Service
                    </Link>
                  </p>
                </form>
              </GlassPanelContent>
            </GlassPanel>
          </div>
        </div>
      </HoloSection>
    </div>
  );
}
