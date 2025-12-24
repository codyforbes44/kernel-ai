import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TeamSession {
  displayName: string;
  expiresAt: string;
  createdAt: string;
}

interface TeamAccessContextType {
  isTeamMember: boolean;
  teamSession: TeamSession | null;
  loading: boolean;
  verifyPasscode: (passcode: string, displayName?: string) => Promise<{
    success: boolean;
    error?: string;
    remainingAttempts?: number;
  }>;
  endSession: () => void;
}

const TeamAccessContext = createContext<TeamAccessContextType | undefined>(undefined);

const TEAM_SESSION_KEY = 'team_access_session';

export function TeamAccessProvider({ children }: { children: ReactNode }) {
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [teamSession, setTeamSession] = useState<TeamSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const validateSession = async () => {
      const storedToken = localStorage.getItem(TEAM_SESSION_KEY);
      
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await supabase.functions.invoke('validate-team-session', {
          body: { sessionToken: storedToken }
        });

        if (response.data?.valid && response.data?.session) {
          setIsTeamMember(true);
          setTeamSession(response.data.session);
        } else {
          // Invalid session, clear it
          localStorage.removeItem(TEAM_SESSION_KEY);
        }
      } catch (error) {
        console.error('Error validating team session:', error);
        localStorage.removeItem(TEAM_SESSION_KEY);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  // Periodically check session validity
  useEffect(() => {
    if (!isTeamMember) return;

    const interval = setInterval(async () => {
      const storedToken = localStorage.getItem(TEAM_SESSION_KEY);
      if (!storedToken) {
        setIsTeamMember(false);
        setTeamSession(null);
        return;
      }

      try {
        const response = await supabase.functions.invoke('validate-team-session', {
          body: { sessionToken: storedToken }
        });

        if (!response.data?.valid) {
          localStorage.removeItem(TEAM_SESSION_KEY);
          setIsTeamMember(false);
          setTeamSession(null);
        }
      } catch (error) {
        console.error('Error checking team session:', error);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isTeamMember]);

  const verifyPasscode = useCallback(async (passcode: string, displayName?: string) => {
    try {
      const response = await supabase.functions.invoke('verify-team-passcode', {
        body: { passcode, displayName }
      });

      if (response.error) {
        return { 
          success: false, 
          error: response.error.message || 'Verification failed',
          remainingAttempts: 0
        };
      }

      if (response.data?.success) {
        // Store session token
        localStorage.setItem(TEAM_SESSION_KEY, response.data.sessionToken);
        
        setIsTeamMember(true);
        setTeamSession({
          displayName: response.data.displayName,
          expiresAt: response.data.expiresAt,
          createdAt: new Date().toISOString()
        });
        
        return { success: true };
      }

      return { 
        success: false, 
        error: response.data?.error || 'Invalid passcode',
        remainingAttempts: response.data?.remainingAttempts
      };
    } catch (error) {
      console.error('Error verifying passcode:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const endSession = useCallback(() => {
    localStorage.removeItem(TEAM_SESSION_KEY);
    setIsTeamMember(false);
    setTeamSession(null);
  }, []);

  return (
    <TeamAccessContext.Provider value={{
      isTeamMember,
      teamSession,
      loading,
      verifyPasscode,
      endSession
    }}>
      {children}
    </TeamAccessContext.Provider>
  );
}

export function useTeamAccess() {
  const context = useContext(TeamAccessContext);
  if (context === undefined) {
    throw new Error('useTeamAccess must be used within a TeamAccessProvider');
  }
  return context;
}