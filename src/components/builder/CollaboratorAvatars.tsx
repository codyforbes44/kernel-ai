import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Collaborator {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  currentFile?: string;
  color: string;
  lastActive: string;
}

interface CollaboratorAvatarsProps {
  collaborators: Collaborator[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function CollaboratorAvatars({ 
  collaborators, 
  maxVisible = 5,
  size = 'sm' 
}: CollaboratorAvatarsProps) {
  const visibleCollaborators = collaborators.slice(0, maxVisible);
  const hiddenCount = collaborators.length - maxVisible;

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (collaborators.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        {visibleCollaborators.map((collaborator) => (
          <Tooltip key={collaborator.id}>
            <TooltipTrigger asChild>
              <div 
                className="relative ring-2 ring-background rounded-full"
                style={{ borderColor: collaborator.color }}
              >
                <Avatar className={cn(sizeClasses[size], 'border-2')} style={{ borderColor: collaborator.color }}>
                  {collaborator.avatarUrl ? (
                    <AvatarImage src={collaborator.avatarUrl} alt={collaborator.displayName} />
                  ) : null}
                  <AvatarFallback 
                    className="text-[10px] font-medium"
                    style={{ backgroundColor: collaborator.color, color: 'white' }}
                  >
                    {getInitials(collaborator.displayName)}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <span 
                  className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-background"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p className="font-medium">{collaborator.displayName}</p>
              {collaborator.currentFile && (
                <p className="text-muted-foreground">
                  Editing: {collaborator.currentFile.split('/').pop()}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
        
        {hiddenCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className={cn(sizeClasses[size], 'ring-2 ring-background')}>
                <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                  +{hiddenCount}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>{hiddenCount} more collaborator{hiddenCount > 1 ? 's' : ''}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}