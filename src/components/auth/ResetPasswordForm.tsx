import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/useHaptic";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { newPasswordSchema, type NewPasswordFormData } from "@/lib/validations";
import { PasswordInput } from "./PasswordInput";

interface ResetPasswordFormProps {
  onComplete: () => void;
}

export function ResetPasswordForm({ onComplete }: ResetPasswordFormProps) {
  const isMobile = useIsMobile();
  const { success, error: hapticError } = useHaptic();

  const form = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const handleSubmit = async (data: NewPasswordFormData) => {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      if (isMobile) hapticError();
      toast.error(error.message);
    } else {
      if (isMobile) success();
      toast.success("Password updated successfully!");
      await supabase.auth.signOut();
      setTimeout(onComplete, 2000);
    }
  };

  if (form.formState.isSubmitSuccessful) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <CheckCircle className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="font-medium">Password updated!</p>
          <p className="text-sm text-muted-foreground">
            Redirecting you to sign in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <PasswordInput
        id="new-password"
        label="New Password"
        register={form.register('password')}
        error={form.formState.errors.password?.message}
      />

      <PasswordInput
        id="confirm-password"
        label="Confirm Password"
        register={form.register('confirmPassword')}
        error={form.formState.errors.confirmPassword?.message}
      />

      <PasswordStrengthIndicator
        password={form.watch('password') || ''}
        showRequirements={true}
      />

      <Button
        type="submit"
        className="w-full min-h-[44px] md:min-h-[40px] touch-manipulation"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
