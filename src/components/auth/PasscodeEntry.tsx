import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { useTeamAccess } from '@/hooks/useTeamAccess';
import { Loader2, AlertTriangle, ArrowLeft, Users } from 'lucide-react';

interface PasscodeEntryProps {
  onBack: () => void;
}

export function PasscodeEntry({ onBack }: PasscodeEntryProps) {
  const navigate = useNavigate();
  const { verifyPasscode } = useTeamAccess();
  
  const [passcode, setPasscode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (passcode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await verifyPasscode(passcode, displayName);

    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid passcode');
      setRemainingAttempts(result.remainingAttempts ?? null);
      setPasscode('');
    }
  };

  const handlePasscodeChange = (value: string) => {
    setPasscode(value);
    setError(null);
    
    // Auto-submit when 6 digits entered
    if (value.length === 6) {
      setTimeout(() => {
        const submitButton = document.getElementById('passcode-submit');
        submitButton?.click();
      }, 100);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </button>

      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Team Access</h2>
        <p className="text-muted-foreground">
          Enter the 6-digit team passcode
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {remainingAttempts !== null && remainingAttempts <= 2 && remainingAttempts > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Warning: {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining before lockout
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Your Name (optional)</Label>
          <Input
            id="displayName"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Passcode</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={passcode}
              onChange={handlePasscodeChange}
              disabled={loading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button
          id="passcode-submit"
          onClick={handleSubmit}
          className="w-full"
          disabled={loading || passcode.length !== 6}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Enter'
          )}
        </Button>
      </div>
    </div>
  );
}