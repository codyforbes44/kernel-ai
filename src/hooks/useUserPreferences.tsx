import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserPreferences {
  autoCreateChatOnProject?: boolean;
  // Add more preferences here as needed
}

const DEFAULT_PREFERENCES: UserPreferences = {
  autoCreateChatOnProject: true,
};

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // Fetch preferences on mount
  useEffect(() => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const storedPrefs = (data?.preferences as UserPreferences) || {};
        setPreferences({ ...DEFAULT_PREFERENCES, ...storedPrefs });
      } catch (error) {
        console.error('Error fetching preferences:', error);
        setPreferences(DEFAULT_PREFERENCES);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  // Update a single preference
  const updatePreference = useCallback(async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    if (!user) return;

    const newPreferences = { ...preferences, [key]: value };
    
    // Optimistically update local state
    setPreferences(newPreferences);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferences: newPreferences })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      // Rollback on error
      setPreferences(preferences);
      console.error('Error updating preference:', error);
    }
  }, [user, preferences]);

  // Update multiple preferences at once
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    const newPreferences = { ...preferences, ...updates };
    
    // Optimistically update local state
    setPreferences(newPreferences);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferences: newPreferences })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      // Rollback on error
      setPreferences(preferences);
      console.error('Error updating preferences:', error);
    }
  }, [user, preferences]);

  return {
    preferences,
    loading,
    updatePreference,
    updatePreferences,
  };
}
