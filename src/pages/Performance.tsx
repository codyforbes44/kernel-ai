import { WebVitalsDashboard } from '@/components/monitoring';
import { SEO } from '@/components/seo/SEO';

export default function Performance() {
  return (
    <>
      <SEO 
        title="Performance Monitoring"
        description="Monitor application performance with real-time Web Vitals tracking"
      />
      <div className="container mx-auto py-8 px-4">
        <WebVitalsDashboard />
      </div>
    </>
  );
}
