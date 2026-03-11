import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { SEO_CONFIG, PAGE_SEO, getOrganizationSchema, getHowToSchema } from '@/lib/seo';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useTutorials, type TutorialData } from '@/hooks/useStaticData';
import { 
  Play, 
  FileText, 
  Clock, 
  Star,
  Rocket,
  Code,
  Database,
  Shield,
  Palette,
  Zap,
} from 'lucide-react';
import { GlowText } from '@/components/ui/glow-text';
import { HoloBadge } from '@/components/ui/holo-badge';
import { HoloSection } from '@/components/ui/holo-section';
import { HoloCard, HoloCardHeader, HoloCardContent, HoloCardTitle, HoloCardDescription } from '@/components/ui/holo-card';

// Icon mapping from string name to component
const iconMap: Record<string, React.ElementType> = {
  Rocket,
  Code,
  Database,
  Shield,
  Palette,
  Zap,
};

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const TutorialCard = ({ tutorial }: { tutorial: TutorialData }) => {
  const IconComponent = iconMap[tutorial.iconName] || Code;
  
  return (
    <Link to={`/tutorials/${tutorial.slug}`}>
      <HoloCard variant="bordered" hover className="cursor-pointer group h-full">
        <HoloCardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              {tutorial.popular && (
                <HoloBadge variant="gold" className="gap-1">
                  <Star className="h-3 w-3 fill-gold text-gold" />
                  Popular
                </HoloBadge>
              )}
              {tutorial.type === 'video' ? (
                <Play className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <HoloCardTitle className="text-lg group-hover:text-primary transition-colors">
            {tutorial.title}
          </HoloCardTitle>
          <HoloCardDescription>{tutorial.description}</HoloCardDescription>
        </HoloCardHeader>
        <HoloCardContent>
          <div className="flex items-center justify-between">
            <Badge className={difficultyColors[tutorial.difficulty]}>
              {tutorial.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {tutorial.duration}
            </div>
          </div>
        </HoloCardContent>
      </HoloCard>
    </Link>
  );
};

const TutorialCardSkeleton = () => (
  <Card className="h-full">
    <CardHeader>
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4 mt-2" />
      <Skeleton className="h-4 w-full mt-2" />
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </CardContent>
  </Card>
);

const Tutorials = () => {
  const { data: tutorials = [], isLoading, error } = useTutorials();

  const beginnerTutorials = tutorials.filter(t => t.difficulty === 'Beginner');
  const intermediateTutorials = tutorials.filter(t => t.difficulty === 'Intermediate');
  const advancedTutorials = tutorials.filter(t => t.difficulty === 'Advanced');
  const popularTutorials = tutorials.filter(t => t.popular);

  const featuredTutorial = popularTutorials[0];
  const howToSchema = featuredTutorial ? getHowToSchema({
    name: featuredTutorial.title,
    description: featuredTutorial.description,
    totalTime: `PT${parseInt(featuredTutorial.duration)}M`,
    steps: [
      { name: 'Start', text: 'Begin the tutorial' },
      { name: 'Follow along', text: 'Complete the guided steps' },
      { name: 'Finish', text: 'Complete the tutorial and practice' },
    ],
  }, SEO_CONFIG.siteUrl) : null;

  if (error) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16 max-w-6xl text-center">
          <h1 className="text-2xl font-bold mb-4">Failed to load tutorials</h1>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <SEOHead
        title="Tutorials — Learn to Build with Kernel AI"
        description="Step-by-step tutorials from beginner to advanced. Master AI-powered development and build production apps faster."
        ogImage={PAGE_SEO.tutorials.ogImage}
        keywords={PAGE_SEO.tutorials.keywords as unknown as string[]}
        canonical="/tutorials"
        breadcrumbs={[
          { name: 'Home', url: SEO_CONFIG.siteUrl },
          { name: 'Tutorials', url: `${SEO_CONFIG.siteUrl}/tutorials` },
        ]}
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          ...(howToSchema ? [howToSchema] : []),
        ]}
      />
      
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <HoloSection variant="gradient" className="text-center mb-12 py-8 -mx-4 px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <GlowText variant="gradient" intensity="medium">Tutorials</GlowText>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn to build amazing applications with step-by-step guides and video tutorials.
          </p>
        </HoloSection>

        {/* Popular tutorials banner */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 fill-gold text-gold drop-shadow-[0_0_6px_hsl(var(--gold)/0.5)]" />
            <GlowText variant="gold" intensity="low">Popular Tutorials</GlowText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <TutorialCardSkeleton />
                <TutorialCardSkeleton />
                <TutorialCardSkeleton />
              </>
            ) : (
              popularTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))
            )}
          </div>
        </div>

        {/* Tabs by difficulty */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Tutorials</TabsTrigger>
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TutorialCardSkeleton key={i} />
                ))
              ) : (
                tutorials.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="beginner">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TutorialCardSkeleton key={i} />
                ))
              ) : (
                beginnerTutorials.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="intermediate">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TutorialCardSkeleton key={i} />
                ))
              ) : (
                intermediateTutorials.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TutorialCardSkeleton key={i} />
                ))
              ) : (
                advancedTutorials.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  );
};

export default Tutorials;
