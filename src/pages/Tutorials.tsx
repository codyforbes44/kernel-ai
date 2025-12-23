import { Link } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';
import { SEO_CONFIG, PAGE_SEO, getOrganizationSchema, getHowToSchema, BREADCRUMBS } from '@/lib/seo';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tutorials, type Tutorial } from '@/lib/tutorial-data';
import { 
  Play, 
  FileText, 
  Clock, 
  Star,
} from 'lucide-react';


const difficultyColors: Record<string, string> = {
  Beginner: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const Tutorials = () => {
  const beginnerTutorials = tutorials.filter(t => t.difficulty === 'Beginner');
  const intermediateTutorials = tutorials.filter(t => t.difficulty === 'Intermediate');
  const advancedTutorials = tutorials.filter(t => t.difficulty === 'Advanced');
  const popularTutorials = tutorials.filter(t => t.popular);

  const TutorialCard = ({ tutorial }: { tutorial: Tutorial }) => (
    <Link to={`/tutorials/${tutorial.slug}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <tutorial.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              {tutorial.popular && (
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3 fill-gold text-gold" />
                  Popular
                </Badge>
              )}
              {tutorial.type === 'video' ? (
                <Play className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {tutorial.title}
          </CardTitle>
          <CardDescription>{tutorial.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge className={difficultyColors[tutorial.difficulty]}>
              {tutorial.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {tutorial.duration}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

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

  return (
    <PublicLayout>
      <SEO
        title={PAGE_SEO.tutorials.title}
        description={PAGE_SEO.tutorials.description}
        ogImage={PAGE_SEO.tutorials.ogImage}
        keywords={PAGE_SEO.tutorials.keywords as unknown as string[]}
        canonical="/tutorials"
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          ...(howToSchema ? [howToSchema] : []),
          BREADCRUMBS.tutorials(SEO_CONFIG.siteUrl),
        ]}
      />
      
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tutorials</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn to build amazing applications with step-by-step guides and video tutorials.
          </p>
        </div>

        {/* Popular tutorials banner */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 fill-gold text-gold" />
            Popular Tutorials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularTutorials.map((tutorial) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} />
            ))}
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
              {tutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="beginner">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beginnerTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="intermediate">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {intermediateTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advancedTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  );
};

export default Tutorials;
