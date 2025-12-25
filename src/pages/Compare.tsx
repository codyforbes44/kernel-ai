import { useRef } from "react";
import { SEO } from "@/components/seo/SEO";
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
import { useCompareExports } from "@/hooks/useCompareExports";

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
        <RadarChartSection />
        <ExclusiveFeatureCallouts />
        <FeatureComparisonTable />
        <CompareCTA />
      </div>
    </>
  );
};

export default Compare;
