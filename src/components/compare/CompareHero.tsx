import { KernelLogo } from "@/components/ui/kernel-logo";
import { ShareButtons } from "./ShareButtons";
import { OGImagePreview } from "./OGImagePreview";
import { SocialComparisonCard } from "@/components/marketing/SocialComparisonCard";
import { CompareOGImage } from "@/components/marketing/CompareOGImage";

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
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex justify-center mb-6">
            <KernelLogo size="xl" glow />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Kernel vs The Competition
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            The only AI platform with everything you need to build, deploy, and scale.
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

        <div className="flex justify-center mb-16">
          <SocialComparisonCard />
        </div>
      </div>
    </section>
  );
};
