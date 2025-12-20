import { useCallback, useRef } from 'react';
import { useUserPreferences } from './useUserPreferences';
import type { Deployment } from './useDeployments';

export function useDeploymentNotifications() {
  const { preferences } = useUserPreferences();
  const previousStatusesRef = useRef<Map<string, string>>(new Map());

  const notifyDeploymentStatus = useCallback((deployment: Deployment) => {
    // Check if notifications are enabled
    if (!preferences.desktopNotifications || !preferences.deploymentNotifications) {
      return;
    }

    // Check browser support
    if (!('Notification' in window)) {
      return;
    }

    // Check permission
    if (Notification.permission !== 'granted') {
      return;
    }

    const previousStatus = previousStatusesRef.current.get(deployment.id);
    
    // Only notify for transitions from building/pending to deployed/failed
    if (previousStatus !== 'building' && previousStatus !== 'pending') {
      // Update ref and skip notification (initial load or already completed)
      previousStatusesRef.current.set(deployment.id, deployment.status);
      return;
    }

    // Update ref before showing notification
    previousStatusesRef.current.set(deployment.id, deployment.status);

    if (deployment.status === 'deployed') {
      const notification = new Notification('Deployment Complete 🚀', {
        body: `v${deployment.version} deployed to ${deployment.environment}`,
        icon: '/pwa-192x192.png',
        tag: `deployment-${deployment.id}`,
      });

      notification.onclick = () => {
        window.focus();
        if (deployment.deployUrl) {
          window.open(deployment.deployUrl, '_blank');
        }
        notification.close();
      };
    } else if (deployment.status === 'failed') {
      const notification = new Notification('Deployment Failed ❌', {
        body: `v${deployment.version} failed on ${deployment.environment}`,
        icon: '/pwa-192x192.png',
        tag: `deployment-${deployment.id}`,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, [preferences.desktopNotifications, preferences.deploymentNotifications]);

  // Track deployment status for detecting transitions
  const trackDeployment = useCallback((deployment: Deployment) => {
    const previousStatus = previousStatusesRef.current.get(deployment.id);
    
    // If status changed to terminal state, trigger notification
    if ((deployment.status === 'deployed' || deployment.status === 'failed') &&
        (previousStatus === 'building' || previousStatus === 'pending')) {
      notifyDeploymentStatus(deployment);
    } else {
      // Update tracking ref
      previousStatusesRef.current.set(deployment.id, deployment.status);
    }
  }, [notifyDeploymentStatus]);

  return {
    trackDeployment,
    notifyDeploymentStatus,
  };
}
