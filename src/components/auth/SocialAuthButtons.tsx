import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHaptic } from "@/hooks/useHaptic";
import { GoogleIcon, GitHubIcon, AppleIcon, LinkedInIcon, MicrosoftIcon } from "./AuthIcons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type OAuthProvider = 'google' | 'github' | 'apple' | 'linkedin_oidc' | 'azure';

interface SocialAuthButtonsProps {
  onProviderClick: (provider: OAuthProvider) => void;
  loadingProvider: OAuthProvider | null;
  disabled?: boolean;
  configuredProviders?: OAuthProvider[];
}

const providers: { id: OAuthProvider; label: string; shortLabel: string; Icon: React.ComponentType }[] = [
  { id: 'google', label: 'Google', shortLabel: 'Google', Icon: GoogleIcon },
  { id: 'github', label: 'GitHub', shortLabel: 'GitHub', Icon: GitHubIcon },
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

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {availableProviders.map(({ id, label, shortLabel, Icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full min-h-[44px] touch-manipulation"
                onClick={() => handleClick(id)}
                disabled={disabled || loadingProvider !== null}
              >
                {loadingProvider === id ? (
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon />
                )}
                <span className="ml-2 hidden sm:inline md:hidden lg:inline">{label}</span>
                <span className="ml-2 hidden md:inline lg:hidden">{shortLabel}</span>
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
