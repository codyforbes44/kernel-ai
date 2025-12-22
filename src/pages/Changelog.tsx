import { SEO } from '@/components/seo/SEO';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Zap, Bug, Calendar } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'feature' | 'improvement' | 'fix';
    description: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.4.0',
    date: 'December 20, 2024',
    changes: [
      { type: 'feature', description: 'AI-powered code generation with context awareness' },
      { type: 'feature', description: 'Real-time collaboration with live cursors' },
      { type: 'improvement', description: 'Enhanced dark mode with OLED optimization' },
      { type: 'fix', description: 'Fixed file tree performance with large projects' },
    ],
  },
  {
    version: '2.3.0',
    date: 'December 10, 2024',
    changes: [
      { type: 'feature', description: 'Component marketplace with 100+ templates' },
      { type: 'feature', description: 'GitHub sync with automatic deployment' },
      { type: 'improvement', description: 'Faster build times with optimized bundling' },
      { type: 'fix', description: 'Resolved authentication edge cases' },
    ],
  },
  {
    version: '2.2.0',
    date: 'November 28, 2024',
    changes: [
      { type: 'feature', description: 'Visual design system editor' },
      { type: 'improvement', description: 'Improved error messages with AI suggestions' },
      { type: 'improvement', description: 'Better mobile responsive preview' },
      { type: 'fix', description: 'Fixed hot reload issues on Windows' },
    ],
  },
  {
    version: '2.1.0',
    date: 'November 15, 2024',
    changes: [
      { type: 'feature', description: 'Database schema visualization' },
      { type: 'feature', description: 'Edge function deployment with logging' },
      { type: 'improvement', description: 'Streamlined onboarding experience' },
      { type: 'fix', description: 'Fixed memory leaks in preview panel' },
    ],
  },
];

const getChangeIcon = (type: 'feature' | 'improvement' | 'fix') => {
  switch (type) {
    case 'feature':
      return <Sparkles className="h-4 w-4" />;
    case 'improvement':
      return <Zap className="h-4 w-4" />;
    case 'fix':
      return <Bug className="h-4 w-4" />;
  }
};

const getChangeBadge = (type: 'feature' | 'improvement' | 'fix') => {
  switch (type) {
    case 'feature':
      return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">New</Badge>;
    case 'improvement':
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Improved</Badge>;
    case 'fix':
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Fixed</Badge>;
  }
};

const Changelog = () => {
  return (
    <PublicLayout>
      <SEO
        title="Changelog"
        description="See what's new in Kernel. Track our latest features, improvements, and bug fixes."
        noIndex={false}
      />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Changelog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track our progress. See the latest features, improvements, and fixes we've shipped.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-8">
            {changelog.map((entry, index) => (
              <Card key={entry.version} className="relative md:ml-16">
                {/* Timeline dot */}
                <div className="absolute -left-[4.5rem] top-6 w-4 h-4 rounded-full bg-primary border-4 border-background hidden md:block" />
                
                <CardHeader>
                  <div className="flex items-center gap-3 flex-wrap">
                    <CardTitle className="text-2xl">v{entry.version}</CardTitle>
                    <Badge variant="outline" className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {entry.date}
                    </Badge>
                    {index === 0 && (
                      <Badge className="bg-primary text-primary-foreground">Latest</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {entry.changes.map((change, changeIndex) => (
                      <li key={changeIndex} className="flex items-start gap-3">
                        <span className="mt-0.5 text-muted-foreground">
                          {getChangeIcon(change.type)}
                        </span>
                        <span className="flex-1">{change.description}</span>
                        {getChangeBadge(change.type)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Changelog;
