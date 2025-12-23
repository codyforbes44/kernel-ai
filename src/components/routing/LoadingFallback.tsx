/**
 * Loading fallback component for Suspense boundaries.
 * Displays a centered spinner while lazy-loaded components are loading.
 */
export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
