import { SEO } from '@/components/seo/SEO';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  FileText, 
  Clock, 
  Star,
  Rocket,
  Database,
  Shield,
  Palette,
  Code,
  Zap
} from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  type: 'video' | 'article';
  category: string;
  icon: React.ElementType;
  popular?: boolean;
}

const tutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Getting Started with Kernel',
    description: 'Learn the basics of Kernel and build your first application in under 10 minutes.',
    difficulty: 'Beginner',
    duration: '10 min',
    type: 'video',
    category: 'Getting Started',
    icon: Rocket,
    popular: true,
  },
  {
    id: '2',
    title: 'Building a Todo App',
    description: 'Create a fully functional todo application with database persistence and user authentication.',
    difficulty: 'Beginner',
    duration: '25 min',
    type: 'video',
    category: 'Getting Started',
    icon: Code,
  },
  {
    id: '3',
    title: 'Database Design Fundamentals',
    description: 'Learn how to design efficient database schemas for your applications.',
    difficulty: 'Intermediate',
    duration: '20 min',
    type: 'article',
    category: 'Database',
    icon: Database,
  },
  {
    id: '4',
    title: 'Implementing User Authentication',
    description: 'Set up secure authentication with email, social login, and role-based access control.',
    difficulty: 'Intermediate',
    duration: '30 min',
    type: 'video',
    category: 'Authentication',
    icon: Shield,
    popular: true,
  },
  {
    id: '5',
    title: 'Creating Custom Design Systems',
    description: 'Build a cohesive design system with custom themes, colors, and typography.',
    difficulty: 'Intermediate',
    duration: '35 min',
    type: 'article',
    category: 'Design',
    icon: Palette,
  },
  {
    id: '6',
    title: 'AI-Powered Development',
    description: 'Master AI prompts and code generation to build applications faster.',
    difficulty: 'Intermediate',
    duration: '40 min',
    type: 'video',
    category: 'AI',
    icon: Zap,
    popular: true,
  },
  {
    id: '7',
    title: 'Advanced State Management',
    description: 'Learn patterns for managing complex application state efficiently.',
    difficulty: 'Advanced',
    duration: '45 min',
    type: 'article',
    category: 'Development',
    icon: Code,
  },
  {
    id: '8',
    title: 'Building Real-time Applications',
    description: 'Create live-updating features with real-time database subscriptions.',
    difficulty: 'Advanced',
    duration: '50 min',
    type: 'video',
    category: 'Database',
    icon: Database,
  },
];

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
  );

  return (
    <PublicLayout>
      <SEO
        title="Tutorials"
        description="Learn to build with Kernel through step-by-step tutorials. From beginner guides to advanced techniques."
        noIndex={false}
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
