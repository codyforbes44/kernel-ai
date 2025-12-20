import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";
import { useIsMobile } from "@/hooks/use-mobile";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations";

interface ForgotPasswordFormProps {
  onResetPassword: (email: string) => Promise<{ error: Error | null }>;
  onBack: () => void;
}

export function ForgotPasswordForm({ onResetPassword, onBack }: ForgotPasswordFormProps) {
  const isMobile = useIsMobile();
  const { success, error: hapticError } = useHaptic();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  });

  const handleSubmit = async (data: ResetPasswordFormData) => {
    const { error } = await onResetPassword(data.email);
    if (error) {
      if (isMobile) hapticError();
      toast.error(error.message);
    } else {
      if (isMobile) success();
    }
  };

  if (form.formState.isSubmitSuccessful) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <CheckCircle className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="font-medium">Check your email</p>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to your email address.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full min-h-[44px] md:min-h-[40px] touch-manipulation"
          onClick={() => {
            form.reset();
            onBack();
          }}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="bg-background min-h-[44px] md:min-h-[40px]"
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full min-h-[44px] md:min-h-[40px] touch-manipulation"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-full justify-center touch-manipulation"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </button>
    </form>
  );
}
