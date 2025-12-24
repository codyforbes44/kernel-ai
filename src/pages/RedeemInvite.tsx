import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { SEO } from '@/components/seo/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInviteCode } from '@/hooks/useInviteCode';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { 
  Ticket, 
  ArrowRight, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

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
    // Store the code in session storage for the auth page to use
    sessionStorage.setItem('invite_code', code.trim().toUpperCase());
    navigate('/auth?mode=signup');
  };

  if (validated && validationResult) {
    return (
      <PublicLayout>
        <SEO
          title="Code Validated | Kernel"
          description="Your invite code has been validated"
          noIndex
        />
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Code Validated!</CardTitle>
              <CardDescription className="text-base">
                Your invite code is valid. Continue to create your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <code className="text-lg font-mono font-bold">{code.toUpperCase()}</code>
                {validationResult.campaign && (
                  <Badge variant="secondary" className="ml-2">
                    {validationResult.campaign}
                  </Badge>
                )}
              </div>
              
              <Button className="w-full" onClick={handleContinue}>
                Create Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <p className="text-xs text-muted-foreground">
                The code will be redeemed when you complete signup
              </p>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <SEO
        title="Enter Invite Code | Kernel"
        description="Enter your invite code to access Kernel"
        noIndex
      />
      
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Ticket className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Enter Your Invite Code
            </h1>
            <p className="text-muted-foreground">
              Kernel is currently invite-only. Enter your code below to get started.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleValidate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Invite Code</Label>
                  <Input
                    id="code"
                    placeholder="KERNEL-XXXX-XXXX"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="font-mono text-center text-lg tracking-wider"
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                <Button type="submit" className="w-full" disabled={validating}>
                  {validating ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Validating...
                    </>
                  ) : (
                    <>
                      Validate Code
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Don't have a code?
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/request-invite">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Request Early Access
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Or follow us on{' '}
                <a 
                  href="https://x.com/kernel" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  X
                </a>
                {' '}for invite code giveaways
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}