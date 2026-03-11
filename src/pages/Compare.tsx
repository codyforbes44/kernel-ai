import { useRef } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { CompareOGImage } from "@/components/marketing/CompareOGImage";
import { CompetitiveAnalysisPDF } from "@/components/marketing/CompetitiveAnalysisPDF";
import { PAGE_SEO, SEO_CONFIG, getBreadcrumbSchema } from "@/lib/seo";
import {
  CompareHero,
  FeatureComparisonTable,
  CompareCTA,
  RadarChartSection,
} from "@/components/compare";
import { ExclusiveFeatureCallouts } from "@/components/compare/ExclusiveFeatureCallouts";
import { CompetitorSwitchSection } from "@/components/compare/CompetitorSwitchSection";
import { SocialProofBanner } from "@/components/compare/SocialProofBanner";
import { AnimatedCoverageCounter } from "@/components/compare/AnimatedCoverageCounter";
import { useCompareExports } from "@/hooks/useCompareExports";
import { HoloSection } from "@/components/ui/holo-section";

const Compare = () => {
  const ogImageRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const exports = useCompareExports({ ogImageRef, pdfRef });

  const siteUrl = SEO_CONFIG.siteUrl;
  const compareSeo = PAGE_SEO.compare;

  return (
    <>
      <SEO
        title={compareSeo.title}
        description={compareSeo.description}
        ogImage={compareSeo.ogImage}
        keywords={[...compareSeo.keywords]}
        structuredData={getBreadcrumbSchema([
          { name: 'Home', url: siteUrl },
          { name: 'Compare', url: `${siteUrl}/compare` }
        ])}
      />

      {/* Hidden Export Components */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <CompareOGImage ref={ogImageRef} />
        <CompetitiveAnalysisPDF ref={pdfRef} />
      </div>

      <div className="min-h-screen bg-background">
        <CompareHero exports={exports} />
        
        {/* Animated Coverage Counter Section */}
        <HoloSection variant="default" className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <AnimatedCoverageCounter />
          </div>
        </HoloSection>

        <SocialProofBanner />
        <RadarChartSection />
        <ExclusiveFeatureCallouts />
        <CompetitorSwitchSection />
        <FeatureComparisonTable />
        <CompareCTA />
      </div>
    </>
  );
};

export default Compare;
