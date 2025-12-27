import { useAuth } from '@/hooks/useAuth';
import { TwoFactorSettings } from './TwoFactorSettings';
import { LoginLocationsSettings } from './LoginLocationsSettings';
import { ExternalSupabaseSettings } from './ExternalSupabaseSettings';

export function SecuritySettings() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <TwoFactorSettings />
      <LoginLocationsSettings userId={user.id} />
      <ExternalSupabaseSettings />
    </>
  );
}
