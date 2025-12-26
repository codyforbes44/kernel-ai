import { CompanionAvatar } from './CompanionAvatar';

interface EmptyStateProps {
  companionName: string;
  personalityType: string;
  avatarUrl?: string | null;
  greeting: string;
}

export function EmptyState({ companionName, personalityType, avatarUrl, greeting }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="flex justify-center mb-4">
        <CompanionAvatar 
          personalityType={personalityType} 
          avatarUrl={avatarUrl} 
          size="lg" 
        />
      </div>
      <h3 className="text-lg font-medium mb-2">{companionName}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">{greeting}</p>
      <p className="text-sm text-muted-foreground">
        Start chatting to build your connection!
      </p>
    </div>
  );
}
