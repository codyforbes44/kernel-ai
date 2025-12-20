import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Number", test: (p) => /[0-9]/.test(p) },
];

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
  className,
}: PasswordStrengthIndicatorProps) {
  const analysis = useMemo(() => {
    const passed = requirements.filter((r) => r.test(password)).length;
    const total = requirements.length;
    const percentage = (passed / total) * 100;

    let strength: "weak" | "fair" | "good" | "strong";
    let color: string;

    if (passed <= 1) {
      strength = "weak";
      color = "bg-destructive";
    } else if (passed === 2) {
      strength = "fair";
      color = "bg-warning";
    } else if (passed === 3) {
      strength = "good";
      color = "bg-primary";
    } else {
      strength = "strong";
      color = "bg-success";
    }

    return { passed, total, percentage, strength, color };
  }, [password]);

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span
            className={cn(
              "font-medium capitalize",
              analysis.strength === "weak" && "text-destructive",
              analysis.strength === "fair" && "text-warning",
              analysis.strength === "good" && "text-primary",
              analysis.strength === "strong" && "text-success"
            )}
          >
            {analysis.strength}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300", analysis.color)}
            style={{ width: `${analysis.percentage}%` }}
            role="progressbar"
            aria-valuenow={analysis.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Password strength: ${analysis.strength}`}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <ul className="grid grid-cols-1 xs:grid-cols-2 gap-1" aria-label="Password requirements">
          {requirements.map((req, index) => {
            const isPassed = req.test(password);
            return (
              <li
                key={index}
                className={cn(
                  "flex items-center gap-1.5 text-xs transition-colors",
                  isPassed ? "text-success" : "text-muted-foreground"
                )}
              >
                {isPassed ? (
                  <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                ) : (
                  <X className="h-3 w-3 shrink-0" aria-hidden="true" />
                )}
                <span>{req.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
