import { ReactNode, lazy, Suspense } from "react";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

// Lazy load heavy Three.js component
const PageBackground3D = lazy(() => 
  import("@/components/three/PageBackground3D").then(m => ({ default: m.PageBackground3D }))
);

interface PublicLayoutProps {
  children: ReactNode;
  showBackground?: boolean;
  backgroundIntensity?: 'low' | 'medium' | 'high';
}

export function PublicLayout({ 
  children, 
  showBackground = true,
  backgroundIntensity = 'low' 
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* 3D Background - conditionally rendered and lazy loaded */}
      {showBackground && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-background" aria-hidden="true" />
        }>
          <PageBackground3D intensity={backgroundIntensity} />
        </Suspense>
      )}
      
      <PublicHeader />
      <main id="main-content" className="flex-1 pt-16 relative z-10" tabIndex={-1}>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
