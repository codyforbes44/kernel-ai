import { SEOHead } from '@/components/seo/SEOHead';
import { MigrationAssistant } from '@/components/migration/MigrationAssistant';

export default function Migrate() {
  return (
    <>
      <SEOHead
        title="Migrate to Kernel — Import From Bolt, v0, Replit"
        description="Import projects from Bolt, v0, Replit, Lovable, and Cursor. Switch to AI-powered development with zero downtime."
        canonical="/migrate"
        breadcrumbs={[
          { name: 'Home', url: 'https://kernel.cool' },
          { name: 'Migrate', url: 'https://kernel.cool/migrate' },
        ]}
      />
      <MigrationAssistant />
    </>
  );
}
