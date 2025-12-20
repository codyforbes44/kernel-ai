import { useParams, Navigate } from 'react-router-dom';
import { BuilderLayout } from '@/components/builder/BuilderLayout';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SEO } from '@/components/seo/SEO';
import { PAGE_SEO, SEO_CONFIG, BREADCRUMBS } from '@/lib/seo';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function BuilderProject() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, loading } = useAuth();

  // Fetch project details for dynamic SEO
  const { data: project } = useQuery({
    queryKey: ['builder-project-seo', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data } = await supabase
        .from('builder_projects')
        .select('name, template')
        .eq('id', projectId)
        .single();
      return data;
    },
    enabled: !!projectId && !!user,
  });

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!projectId) {
    return <Navigate to="/builder" replace />;
  }

  const projectName = project?.name || 'Project';
  const templateName = project?.template || undefined;

  return (
    <>
      <SEO
        title={PAGE_SEO.builderProject.titleTemplate(projectName)}
        description={PAGE_SEO.builderProject.descriptionTemplate(projectName, templateName)}
        ogImage={PAGE_SEO.builderProject.ogImage}
        noIndex
        structuredData={BREADCRUMBS.builderProject(SEO_CONFIG.siteUrl, projectName, projectId)}
      />
      <BuilderLayout projectId={projectId} />
    </>
  );
}
