import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { useSubscription, STRIPE_PRICES } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { PremiumUpgradeModal } from "@/components/ui/premium-upgrade-modal";
import { toast } from "sonner";

interface FeatureGatingContextType {
  /**
   * Check if user has Pro access
   */
  isPro: boolean;
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * Loading state for subscription check
   */
  isLoading: boolean;
  
  /**
   * Check if a feature is accessible. Returns true if user has Pro access.
   * If not, shows the upgrade modal with the feature name.
   */
  checkAccess: (featureName?: string) => boolean;
  
  /**
   * Require Pro access to execute a callback.
   * If user has access, executes the callback.
   * If not, shows the upgrade modal.
   */
  requirePro: <T>(callback: () => T, featureName?: string) => T | undefined;
  
  /**
   * Show the upgrade modal manually
   */
  showUpgradeModal: (featureName?: string) => void;
  
  /**
   * Hide the upgrade modal
   */
  hideUpgradeModal: () => void;
}

const FeatureGatingContext = createContext<FeatureGatingContextType | null>(null);

interface FeatureGatingProviderProps {
  children: ReactNode;
}

export function FeatureGatingProvider({ children }: FeatureGatingProviderProps) {
  const { user } = useAuth();
  const { subscribed, isLoading, createCheckoutSession } = useSubscription();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFeatureName, setModalFeatureName] = useState<string | undefined>();

  const isPro = subscribed;
  const isAuthenticated = !!user;

  const showUpgradeModal = useCallback((featureName?: string) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to access this feature");
      return;
    }
    setModalFeatureName(featureName);
    setIsModalOpen(true);
  }, [isAuthenticated]);

  const hideUpgradeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const checkAccess = useCallback((featureName?: string): boolean => {
    if (isPro) {
      return true;
    }
    showUpgradeModal(featureName);
    return false;
  }, [isPro, showUpgradeModal]);

  const requirePro = useCallback(<T,>(callback: () => T, featureName?: string): T | undefined => {
    if (checkAccess(featureName)) {
      return callback();
    }
    return undefined;
  }, [checkAccess]);

  const handleUpgrade = useCallback(() => {
    // Default to monthly pricing
    createCheckoutSession(STRIPE_PRICES.PRO_MONTHLY);
  }, [createCheckoutSession]);

  const value: FeatureGatingContextType = {
    isPro,
    isAuthenticated,
    isLoading,
    checkAccess,
    requirePro,
    showUpgradeModal,
    hideUpgradeModal,
  };

  return (
    <FeatureGatingContext.Provider value={value}>
      {children}
      <PremiumUpgradeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        featureName={modalFeatureName}
        onUpgrade={handleUpgrade}
      />
    </FeatureGatingContext.Provider>
  );
}

/**
 * Hook to check Pro access and gate features behind the upgrade modal.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isPro, checkAccess, requirePro } = useFeatureGating();
 * 
 *   // Check access and show modal if not Pro
 *   const handleClick = () => {
 *     if (checkAccess("AI Code Generation")) {
 *       // User has access, proceed with feature
 *     }
 *   };
 * 
 *   // Or use requirePro for cleaner syntax
 *   const handleExport = () => {
 *     requirePro(() => {
 *       // This only runs if user has Pro access
 *       exportData();
 *     }, "Data Export");
 *   };
 * 
 *   // Conditionally render based on Pro status
 *   return (
 *     <div>
 *       {isPro ? <ProFeature /> : <LockedFeature />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFeatureGating(): FeatureGatingContextType {
  const context = useContext(FeatureGatingContext);
  
  if (!context) {
    throw new Error("useFeatureGating must be used within a FeatureGatingProvider");
  }
  
  return context;
}

/**
 * Higher-order component to wrap a component that requires Pro access.
 * Shows the upgrade modal when the wrapped component tries to render without Pro access.
 */
export function withProAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureName?: string
) {
  return function ProGatedComponent(props: P) {
    const { isPro, showUpgradeModal } = useFeatureGating();

    if (!isPro) {
      // Show a locked state or trigger the modal
      return (
        <div 
          onClick={() => showUpgradeModal(featureName)}
          className="cursor-pointer opacity-50 hover:opacity-75 transition-opacity"
        >
          <WrappedComponent {...props} />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Component that only renders children if user has Pro access.
 * Otherwise shows a locked placeholder or nothing.
 */
interface ProOnlyProps {
  children: ReactNode;
  featureName?: string;
  fallback?: ReactNode;
  showLockedState?: boolean;
}

export function ProOnly({ 
  children, 
  featureName, 
  fallback,
  showLockedState = false 
}: ProOnlyProps) {
  const { isPro, showUpgradeModal } = useFeatureGating();

  if (isPro) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showLockedState) {
    return (
      <div 
        onClick={() => showUpgradeModal(featureName)}
        className="cursor-pointer p-4 border border-gold/30 rounded-lg bg-gold/5 text-center hover:bg-gold/10 transition-colors"
      >
        <p className="text-sm text-muted-foreground">
          🔒 {featureName || "This feature"} requires Pro
        </p>
      </div>
    );
  }

  return null;
}
