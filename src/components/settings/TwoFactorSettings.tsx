import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Shield,
  Smartphone,
  Key,
  Check,
  Copy,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';

interface Factor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at: string;
}

export function TwoFactorSettings() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);
  
  // Enrollment state
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<{
    id: string;
    qrCode: string;
    secret: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [secretCopied, setSecretCopied] = useState(false);
  
  // Disable state
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [factorToDisable, setFactorToDisable] = useState<Factor | null>(null);

  const loadFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setFactors(data.totp || []);
    } catch (error) {
      console.error('Failed to load MFA factors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const hasVerifiedFactor = factors.some(f => f.status === 'verified');

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });
      
      if (error) throw error;
      
      setEnrollmentData({
        id: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setShowEnrollDialog(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start 2FA enrollment');
    } finally {
      setEnrolling(false);
    }
  };

  const handleVerify = async () => {
    if (!enrollmentData || verificationCode.length !== 6) return;
    
    setVerifying(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollmentData.id,
      });
      
      if (challengeError) throw challengeError;
      
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollmentData.id,
        challengeId: challengeData.id,
        code: verificationCode,
      });
      
      if (verifyError) throw verifyError;
      
      toast.success('Two-factor authentication enabled successfully!');
      setShowEnrollDialog(false);
      setEnrollmentData(null);
      setVerificationCode('');
      loadFactors();
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable = async () => {
    if (!factorToDisable) return;
    
    setDisabling(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: factorToDisable.id,
      });
      
      if (error) throw error;
      
      toast.success('Two-factor authentication disabled');
      setShowDisableDialog(false);
      setFactorToDisable(null);
      loadFactors();
    } catch (error: any) {
      toast.error(error.message || 'Failed to disable 2FA');
    } finally {
      setDisabling(false);
    }
  };

  const copySecret = () => {
    if (enrollmentData?.secret) {
      navigator.clipboard.writeText(enrollmentData.secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
      toast.success('Secret copied to clipboard');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
            {hasVerifiedFactor ? (
              <Badge variant="default" className="ml-2 gap-1">
                <ShieldCheck className="h-3 w-3" />
                Enabled
              </Badge>
            ) : (
              <Badge variant="secondary" className="ml-2 gap-1">
                <ShieldOff className="h-3 w-3" />
                Disabled
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account using an authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasVerifiedFactor ? (
            <>
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Your account is protected</p>
                  <p className="text-sm text-muted-foreground">
                    Two-factor authentication is enabled using an authenticator app
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Label>Enrolled Devices</Label>
                {factors.filter(f => f.status === 'verified').map((factor) => (
                  <div
                    key={factor.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{factor.friendly_name || 'Authenticator App'}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(factor.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setFactorToDisable(factor);
                        setShowDisableDialog(true);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="font-medium">Enhance your security</p>
                  <p className="text-sm text-muted-foreground">
                    Enable two-factor authentication to protect your account from unauthorized access
                  </p>
                </div>
              </div>
              
              <Button onClick={handleEnroll} disabled={enrolling} className="w-full gap-2">
                {enrolling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Key className="h-4 w-4" />
                )}
                Enable Two-Factor Authentication
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Set Up Authenticator App
            </DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (like Google Authenticator, Authy, or 1Password)
            </DialogDescription>
          </DialogHeader>
          
          {enrollmentData && (
            <div className="space-y-6">
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <QRCodeSVG
                  value={enrollmentData.qrCode}
                  size={200}
                  level="M"
                  includeMargin
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Or enter this code manually:
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                    {enrollmentData.secret}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copySecret}
                  >
                    {secretCopied ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="verification-code">Enter verification code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEnrollDialog(false);
                setEnrollmentData(null);
                setVerificationCode('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verificationCode.length !== 6 || verifying}
            >
              {verifying ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Confirmation Dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Disable Two-Factor Authentication?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove two-factor authentication from your account. Your account will be less secure without this extra layer of protection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disabling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable}
              disabled={disabling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disabling ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Disable 2FA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
