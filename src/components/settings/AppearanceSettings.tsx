import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Shield, Palette } from 'lucide-react';
import { DisplayModeCard } from './DisplayModeCard';

export function AppearanceSettings() {
  const { user } = useAuth();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .maybeSingle();

        const prefs = data?.preferences as { reduced_motion?: boolean; high_contrast?: boolean } | null;
        const reducedMotionPref = prefs?.reduced_motion ?? false;
        const highContrastPref = prefs?.high_contrast ?? false;
        setReducedMotion(reducedMotionPref);
        setHighContrast(highContrastPref);

        if (reducedMotionPref) document.documentElement.classList.add('reduce-motion');
        if (highContrastPref) document.documentElement.classList.add('high-contrast');
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadPreferences();
  }, [user]);

  const handleReducedMotionChange = async (enabled: boolean) => {
    if (!user) return;
    setReducedMotion(enabled);
    setIsSavingPreferences(true);

    if (enabled) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .maybeSingle();

      const currentPrefs = (profile?.preferences as Record<string, unknown>) || {};
      const updatedPrefs = { ...currentPrefs, reduced_motion: enabled };

      const { error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPrefs })
        .eq('id', user.id);

      if (error) throw error;
      toast.success(enabled ? 'Reduced motion enabled' : 'Reduced motion disabled');
    } catch (error) {
      console.error('Failed to save preference:', error);
      toast.error('Failed to save preference');
      setReducedMotion(!enabled);
      if (!enabled) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleHighContrastChange = async (enabled: boolean) => {
    if (!user) return;
    setHighContrast(enabled);
    setIsSavingPreferences(true);

    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .maybeSingle();

      const currentPrefs = (profile?.preferences as Record<string, unknown>) || {};
      const updatedPrefs = { ...currentPrefs, high_contrast: enabled };

      const { error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPrefs })
        .eq('id', user.id);

      if (error) throw error;
      toast.success(enabled ? 'High contrast enabled' : 'High contrast disabled');
    } catch (error) {
      console.error('Failed to save preference:', error);
      toast.error('Failed to save preference');
      setHighContrast(!enabled);
      if (!enabled) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    } finally {
      setIsSavingPreferences(false);
    }
  };

  return (
    <>
      <DisplayModeCard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Accessibility
          </CardTitle>
          <CardDescription>Visual adjustments for better readability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                High Contrast
              </Label>
              <p className="text-sm text-muted-foreground">
                Increase text contrast and reduce visual complexity
              </p>
            </div>
            <Switch
              checked={highContrast}
              onCheckedChange={handleHighContrastChange}
              disabled={isLoadingProfile || isSavingPreferences}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Reduce animations throughout the app
              </p>
            </div>
            <Switch
              checked={reducedMotion}
              onCheckedChange={handleReducedMotionChange}
              disabled={isLoadingProfile || isSavingPreferences}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
