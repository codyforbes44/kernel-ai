import { useParams, useNavigate, Link } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';
import { SEO_CONFIG, getOrganizationSchema, getHowToSchema, getBreadcrumbSchema } from '@/lib/seo';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useTutorial, useTutorials, type TutorialData } from '@/hooks/useStaticData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Play, 
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Star
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';
import { cn } from '@/lib/utils';

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const TutorialDetailSkeleton = () => (
  <article className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
    <Skeleton className="h-9 w-32 mb-6" />
    <header className="mb-12">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-12 w-3/4 mb-4" />
      <Skeleton className="h-6 w-full" />
    </header>
    <div className="grid md:grid-cols-2 gap-6 mb-12">
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  </article>
);

const TutorialDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: tutorial, isLoading, error } = useTutorial(slug || '');
  const { data: allTutorials = [] } = useTutorials();

  // Get related tutorials based on category or difficulty
  const getRelatedTutorials = (currentTutorial: TutorialData, limit = 3): TutorialData[] => {
    return allTutorials
      .filter(t => 
        t.id !== currentTutorial.id && 
        (t.category === currentTutorial.category || t.difficulty === currentTutorial.difficulty)
      )
      .slice(0, limit);
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <TutorialDetailSkeleton />
      </PublicLayout>
    );
  }

  if (error || !tutorial) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-4">Tutorial Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The tutorial you're looking for doesn't exist or has been moved.
          </p>
          <Button onClick={() => navigate('/tutorials')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tutorials
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const relatedTutorials = getRelatedTutorials(tutorial);
  
  const howToSchema = getHowToSchema({
    name: tutorial.title,
    description: tutorial.description,
    totalTime: `PT${parseInt(tutorial.duration)}M`,
    steps: tutorial.steps.map(step => ({
      name: step.title,
      text: step.content.substring(0, 200),
    })),
  }, SEO_CONFIG.siteUrl);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SEO_CONFIG.siteUrl },
    { name: 'Tutorials', url: `${SEO_CONFIG.siteUrl}/tutorials` },
    { name: tutorial.title, url: `${SEO_CONFIG.siteUrl}/tutorials/${tutorial.slug}` },
  ]);

  return (
    <PublicLayout>
      <SEO
        title={`${tutorial.title} | Kernel Tutorials`}
        description={tutorial.description}
        ogImage="/og-images/tutorials.png"
        keywords={[tutorial.category, tutorial.difficulty, 'tutorial', 'guide', 'learn']}
        canonical={`/tutorials/${tutorial.slug}`}
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          howToSchema,
          breadcrumbSchema,
        ]}
      />

      <article className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/tutorials')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Tutorials
        </Button>

        {/* Hero Section */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className={difficultyColors[tutorial.difficulty]}>
              {tutorial.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {tutorial.duration}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {tutorial.type === 'video' ? (
                <>
                  <Play className="h-4 w-4" />
                  Video Tutorial
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Written Guide
                </>
              )}
            </div>
            <Badge variant="outline">{tutorial.category}</Badge>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {tutorial.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            {tutorial.description}
          </p>
        </header>

        {/* Prerequisites & Learning Outcomes */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Prerequisites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tutorial.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span>{prereq}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-gold fill-gold" />
                What You'll Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tutorial.whatYouWillLearn.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Separator className="mb-12" />

        {/* Tutorial Steps */}
        <div className="space-y-12">
          {tutorial.steps.map((step, index) => (
            <section key={index} className="scroll-mt-20" id={`step-${index + 1}`}>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{step.title}</h2>
                </div>
              </div>

              <div className="pl-14">
                <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
                  <MarkdownRenderer content={step.content} />
                </div>

                {step.codeExample && (
                  <Card className="mb-6 overflow-hidden">
                    {step.codeExample.filename && (
                      <div className="bg-muted px-4 py-2 border-b text-sm font-mono text-muted-foreground">
                        {step.codeExample.filename}
                      </div>
                    )}
                    <CardContent className="p-0">
                      <MarkdownRenderer 
                        content={`\`\`\`${step.codeExample.language}\n${step.codeExample.code}\n\`\`\``} 
                      />
                    </CardContent>
                  </Card>
                )}

                {step.tip && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
                    <Lightbulb className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">{step.tip}</p>
                  </div>
                )}

                {step.warning && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">{step.warning}</p>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        <Separator className="my-12" />

        {/* Navigation */}
        <nav className="flex flex-col sm:flex-row justify-between gap-4 mb-12">
          {tutorial.prevTutorial ? (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/tutorials/${tutorial.prevTutorial}`)}
              className="justify-start"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Tutorial
            </Button>
          ) : (
            <div />
          )}
          {tutorial.nextTutorial && (
            <Button 
              onClick={() => navigate(`/tutorials/${tutorial.nextTutorial}`)}
              className="justify-end"
            >
              Next Tutorial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </nav>

        {/* Related Tutorials */}
        {relatedTutorials.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Related Tutorials</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedTutorials.map((related) => (
                <Link key={related.id} to={`/tutorials/${related.slug}`}>
                  <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={cn('text-xs', difficultyColors[related.difficulty])}>
                          {related.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {related.duration}
                        </span>
                      </div>
                      <CardTitle className="text-base">{related.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {related.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </PublicLayout>
  );
};

export default TutorialDetail;
