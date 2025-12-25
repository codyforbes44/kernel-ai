import { ReactNode } from "react";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { PageBackground3D } from "@/components/three/PageBackground3D";

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
      {/* 3D Background - conditionally rendered */}
      {showBackground && <PageBackground3D intensity={backgroundIntensity} />}
      
      <PublicHeader />
      <main id="main-content" className="flex-1 pt-16 relative z-10" tabIndex={-1}>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
