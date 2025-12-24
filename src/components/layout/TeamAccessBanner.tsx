import { useTeamAccess } from '@/hooks/useTeamAccess';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, LogOut, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function TeamAccessBanner() {
  const { isTeamMember, teamSession, endSession } = useTeamAccess();

  if (!isTeamMember || !teamSession) return null;

  const expiresAt = new Date(teamSession.expiresAt);
  const timeRemaining = formatDistanceToNow(expiresAt, { addSuffix: false });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur-sm text-amber-950 px-4 py-2">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-amber-400/50 border-amber-600 text-amber-950">
            <Users className="mr-1 h-3 w-3" />
            Team Access
          </Badge>
          <span className="text-sm font-medium">
            {teamSession.displayName}
          </span>
          <span className="text-xs text-amber-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeRemaining} remaining
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={endSession}
          className="text-amber-950 hover:bg-amber-400/50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Exit
        </Button>
      </div>
    </div>
  );
}