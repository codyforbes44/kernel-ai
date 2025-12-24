import { logger } from './logger';

/**
 * Forces a hard refresh of the application.
 * Clears caches, tells service worker to skip waiting, and reloads the page.
 */
export async function forceRefresh(): Promise<void> {
  logger.log('Force refreshing application...');
  
  try {
    // Tell any waiting service worker to activate immediately
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
    
    // Clear caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      logger.log('Cleared caches:', cacheNames);
    }
  } catch (error) {
    logger.error('Error during force refresh cleanup:', error);
  }
  
  // Hard reload - bypass cache
  window.location.reload();
}

/**
 * Checks if there's a service worker update available.
 */
export async function checkForUpdate(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return !!registration.waiting;
    }
  } catch (error) {
    logger.error('Error checking for update:', error);
  }
  
  return false;
}
