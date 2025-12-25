import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { SEO } from '@/components/seo/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInviteCode } from '@/hooks/useInviteCode';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Zap, 
  Shield,
  Ticket
} from 'lucide-react';

const requestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  use_case: z.string()
    .min(20, 'Please provide more detail (at least 20 characters)')
    .max(2000, 'Use case is too long (max 2000 characters)')
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function RequestInvite() {
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

  if (submitted) {
    return (
      <PublicLayout>
        <SEO
          title="Request Submitted | Kernel"
          description="Your early access request has been submitted"
          noIndex
        />
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Request Submitted!</CardTitle>
              <CardDescription className="text-base">
                Thank you for your interest in Kernel. We'll review your application and be in touch if you're selected for early access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                In the meantime, follow us on X for updates and exclusive invite code giveaways.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild>
                  <a href="https://x.com/kernel" target="_blank" rel="noopener noreferrer">
                    Follow on X
                  </a>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <SEO
        title="Request Early Access | Kernel"
        description="Request exclusive early access to Kernel - the AI-powered development platform"
      />
      
      <div className="min-h-[calc(100vh-4rem)] py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Info */}
            <div className="space-y-8">
              <div>
                <Badge variant="secondary" className="mb-4">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Limited Early Access
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight mb-4">
                  Get Early Access to Kernel
                </h1>
                <p className="text-lg text-muted-foreground">
                  We're opening up Kernel to a select group of early adopters. 
                  Tell us about yourself and how you plan to use Kernel, and we'll 
                  consider you for exclusive access.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Build 10x Faster</h3>
                    <p className="text-sm text-muted-foreground">
                      Go from idea to deployed app in minutes with AI assistance
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Production Ready</h3>
                    <p className="text-sm text-muted-foreground">
                      Built-in auth, database, and deployment infrastructure
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Join the Community</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with other builders and shape the future of Kernel
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="h-4 w-4 text-primary" />
                  <span className="font-medium">Have an invite code?</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  If you already have an invite code, you can sign up directly.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">
                    Enter Invite Code
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column - Form */}
            <Card>
              <CardHeader>
                <CardTitle>Request Access</CardTitle>
                <CardDescription>
                  Access is not guaranteed. We review each request individually.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      {...register('name')}
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
                    />
                    {errors.use_case && (
                      <p className="text-sm text-destructive">{errors.use_case.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Minimum 20 characters. The more detail you provide, the better we can evaluate your request.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting, you agree to our{' '}
                    <Link to="/privacy" className="underline hover:text-foreground">
                      Privacy Policy
                    </Link>
                    {' '}and{' '}
                    <Link to="/terms" className="underline hover:text-foreground">
                      Terms of Service
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}