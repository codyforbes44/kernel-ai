import { useState, useEffect, useCallback } from 'react';

interface BiometricCredential {
  credentialId: string;
  email: string;
  createdAt: string;
}

const STORAGE_KEY = 'kernel_biometric_credentials';

export function useBiometricAuth() {
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedCredential, setSavedCredential] = useState<BiometricCredential | null>(null);

  // Check if WebAuthn is supported and platform authenticator is available
  useEffect(() => {
    const checkSupport = async () => {
      // Check if WebAuthn API is available
      if (!window.PublicKeyCredential) {
        setIsSupported(false);
        return;
      }

      setIsSupported(true);

      try {
        // Check if platform authenticator (Face ID/Touch ID/Windows Hello) is available
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsAvailable(available);
      } catch {
        setIsAvailable(false);
      }

      // Check for saved credentials
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setSavedCredential(JSON.parse(stored));
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    };

    checkSupport();
  }, []);

  // Generate a random challenge
  const generateChallenge = useCallback((): Uint8Array => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return array;
  }, []);

  // Convert ArrayBuffer to base64 string
  const bufferToBase64 = useCallback((buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  }, []);

  // Convert base64 string to ArrayBuffer
  const base64ToBuffer = useCallback((base64: string): ArrayBuffer => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }, []);

  // Register biometric credentials for a user
  const register = useCallback(async (email: string, userId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAvailable) {
      return { success: false, error: 'Biometric authentication is not available on this device' };
    }

    setIsLoading(true);

    try {
      // Create credential options
      const challenge = generateChallenge();
      const userIdBuffer = new TextEncoder().encode(userId);
      
      const createOptions: CredentialCreationOptions = {
        publicKey: {
          challenge: challenge as BufferSource,
          rp: {
            name: 'Kernel',
            id: window.location.hostname,
          },
          user: {
            id: userIdBuffer as BufferSource,
            name: email,
            displayName: email.split('@')[0],
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        },
      };

      const credential = await navigator.credentials.create(createOptions) as PublicKeyCredential;
      
      if (!credential) {
        return { success: false, error: 'Failed to create credential' };
      }

      // Store credential info locally
      const credentialData: BiometricCredential = {
        credentialId: bufferToBase64(credential.rawId),
        email,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(credentialData));
      setSavedCredential(credentialData);

      return { success: true };
    } catch (error) {
      console.error('Biometric registration error:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          return { success: false, error: 'Biometric authentication was cancelled or not allowed' };
        }
        if (error.name === 'InvalidStateError') {
          return { success: false, error: 'Biometric credentials already exist for this account' };
        }
        return { success: false, error: error.message };
      }
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable, generateChallenge, bufferToBase64]);

  // Authenticate using biometric
  const authenticate = useCallback(async (): Promise<{ success: boolean; email?: string; error?: string }> => {
    if (!savedCredential) {
      return { success: false, error: 'No biometric credentials found' };
    }

    setIsLoading(true);

    try {
      const challenge = generateChallenge();
      const credentialIdBuffer = base64ToBuffer(savedCredential.credentialId);

      const getOptions: CredentialRequestOptions = {
        publicKey: {
          challenge: challenge as BufferSource,
          rpId: window.location.hostname,
          allowCredentials: [
            {
              type: 'public-key',
              id: credentialIdBuffer as BufferSource,
              transports: ['internal'],
            },
          ],
          userVerification: 'required',
          timeout: 60000,
        },
      };

      const assertion = await navigator.credentials.get(getOptions) as PublicKeyCredential;
      
      if (!assertion) {
        return { success: false, error: 'Authentication failed' };
      }

      return { success: true, email: savedCredential.email };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          return { success: false, error: 'Biometric authentication was cancelled' };
        }
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  }, [savedCredential, generateChallenge, base64ToBuffer]);

  // Remove saved credentials
  const removeCredentials = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedCredential(null);
  }, []);

  return {
    isSupported,
    isAvailable,
    isLoading,
    savedCredential,
    register,
    authenticate,
    removeCredentials,
  };
}
