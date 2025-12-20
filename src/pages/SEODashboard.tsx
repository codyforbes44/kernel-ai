import { SEO } from "@/components/seo/SEO";
import { SEOHealthDashboard } from "@/components/seo/SEOHealthDashboard";
import { PublicLayout } from "@/components/layout/PublicLayout";

export default function SEODashboard() {
  return (
    <PublicLayout>
      <SEO 
        title="SEO Health Dashboard"
        description="Monitor sitemap coverage, robots.txt rules, and SEO configuration"
        noIndex={true}
      />
      <div className="container py-8 md:py-12">
        <SEOHealthDashboard />
      </div>
    </PublicLayout>
  );
}
