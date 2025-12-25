import { KernelLogo } from "@/components/ui/kernel-logo";
import { ShareButtons } from "./ShareButtons";
import { OGImagePreview } from "./OGImagePreview";
import { SocialComparisonCard } from "@/components/marketing/SocialComparisonCard";
import { HoloSection } from "@/components/ui/holo-section";
import { HoloBadge } from "@/components/ui/holo-badge";
import { GlowText } from "@/components/ui/glow-text";

interface CompareHeroProps {
  exports: {
    isDownloading: boolean;
    isGeneratingPDF: boolean;
    handleShareTwitter: () => void;
    handleCopyLink: () => void;
    handleDownloadOGImage: () => void;
    handleDownloadPDF: () => void;
  };
}

export const CompareHero = ({ exports }: CompareHeroProps) => {
  return (
    <HoloSection variant="gradient" className="relative py-12 md:py-16 lg:py-24 overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12),transparent_60%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <div className="flex justify-center items-center gap-3 mb-4 md:mb-6">
            <KernelLogo size="lg" glow className="md:hidden" />
            <KernelLogo size="xl" glow className="hidden md:block" />
            <HoloBadge variant="glow">2024</HoloBadge>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 md:mb-4">
            <GlowText variant="gradient" intensity="medium" className="inline">
              Kernel vs The Competition
            </GlowText>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground px-4 md:px-0">
            The only AI platform with{" "}
            <span className="text-primary">everything you need</span> to build, deploy, and scale.
          </p>
        </div>

        <ShareButtons
          onShareTwitter={exports.handleShareTwitter}
          onCopyLink={exports.handleCopyLink}
          onDownloadOGImage={exports.handleDownloadOGImage}
          onDownloadPDF={exports.handleDownloadPDF}
          isDownloading={exports.isDownloading}
          isGeneratingPDF={exports.isGeneratingPDF}
        />

        <OGImagePreview />

        {/* Desktop only: Show full social card */}
        <div className="hidden lg:flex justify-center mb-16">
          <SocialComparisonCard />
        </div>

        {/* Tablet: Show condensed version */}
        <div className="hidden md:flex lg:hidden justify-center mb-12">
          <SocialComparisonCard className="max-w-2xl" />
        </div>
      </div>
    </HoloSection>
  );
};
