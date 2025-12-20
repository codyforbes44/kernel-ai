import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface ProfileData {
  display_name?: string;
  avatar_url?: string;
  preferences?: Json;
}

export function useSaveToProfile() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveToProfile = useCallback(async (
    userId: string,
    data: ProfileData,
    options?: { successMessage?: string; errorMessage?: string }
  ) => {
    const { 
      successMessage = 'Settings saved', 
      errorMessage = 'Failed to save settings' 
    } = options || {};

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: successMessage,
      });
      return { success: true, error: null };
    } catch (error) {
      console.error('Error saving to profile:', error);
      toast({
        title: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updatePreference = useCallback(async (
    userId: string,
    key: string,
    value: Json,
    currentPreferences: Record<string, Json> = {}
  ) => {
    const updatedPreferences: Record<string, Json> = {
      ...currentPreferences,
      [key]: value,
    };
    
    return saveToProfile(userId, { preferences: updatedPreferences as Json });
  }, [saveToProfile]);

  return {
    saveToProfile,
    updatePreference,
    isSaving,
  };
}
