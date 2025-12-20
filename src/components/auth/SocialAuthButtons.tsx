import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHaptic } from "@/hooks/useHaptic";
import { GoogleIcon, GitHubIcon, AppleIcon, LinkedInIcon, MicrosoftIcon, XIcon } from "./AuthIcons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type OAuthProvider = 'google' | 'github' | 'apple' | 'linkedin_oidc' | 'azure' | 'twitter';

interface SocialAuthButtonsProps {
  onProviderClick: (provider: OAuthProvider) => void;
  loadingProvider: OAuthProvider | null;
  disabled?: boolean;
  configuredProviders?: OAuthProvider[];
}

const providers: { id: OAuthProvider; label: string; shortLabel: string; Icon: React.ComponentType }[] = [
  { id: 'google', label: 'Google', shortLabel: 'Google', Icon: GoogleIcon },
  { id: 'github', label: 'GitHub', shortLabel: 'GitHub', Icon: GitHubIcon },
  { id: 'twitter', label: 'X', shortLabel: 'X', Icon: XIcon },
  { id: 'apple', label: 'Apple', shortLabel: 'Apple', Icon: AppleIcon },
  { id: 'linkedin_oidc', label: 'LinkedIn', shortLabel: 'LinkedIn', Icon: LinkedInIcon },
  { id: 'azure', label: 'Microsoft', shortLabel: 'MS', Icon: MicrosoftIcon },
];

export function SocialAuthButtons({ 
  onProviderClick, 
  loadingProvider, 
  disabled,
  configuredProviders 
}: SocialAuthButtonsProps) {
  const isMobile = useIsMobile();
  const { light } = useHaptic();

  const handleClick = (provider: OAuthProvider) => {
    if (isMobile) {
      light();
    }
    onProviderClick(provider);
  };

  // If configuredProviders is undefined, show all (loading state or no check)
  // If it's an empty array, no providers are configured
  const availableProviders = configuredProviders === undefined 
    ? providers 
    : providers.filter(p => configuredProviders.includes(p.id));

  if (availableProviders.length === 0) {
    return null; // Don't show the section if no providers configured
  }

  // Calculate grid layout based on number of providers
  const getGridClasses = () => {
    const count = availableProviders.length;
    if (count <= 3) return "grid-cols-3";
    if (count <= 4) return "grid-cols-2 sm:grid-cols-4";
    if (count <= 6) return "grid-cols-3 sm:grid-cols-6";
    return "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6";
  };

  return (
    <TooltipProvider>
      <div className={cn("grid gap-2", getGridClasses())}>
        {availableProviders.map(({ id, label, Icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full min-h-[44px] sm:min-h-[40px] touch-manipulation px-2 sm:px-3"
                onClick={() => handleClick(id)}
                disabled={disabled || loadingProvider !== null}
              >
                {loadingProvider === id ? (
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon />
                )}
                <span className="sr-only">{label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign in with {label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
