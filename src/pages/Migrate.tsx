import { SEO } from '@/components/seo/SEO';
import { MigrationAssistant } from '@/components/migration/MigrationAssistant';

export default function Migrate() {
  return (
    <>
      <SEO
        title="Migrate to Kernel | Import Your Projects"
        description="Import projects from Bolt, v0, Replit, Lovable, Cursor and more. Get access to AI-powered development, built-in database, and one-click deployment."
      />
      <MigrationAssistant />
    </>
  );
}
