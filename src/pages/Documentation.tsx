import { SEO } from '@/components/seo/SEO';
import { SEO_CONFIG, PAGE_SEO, getOrganizationSchema, getBreadcrumbSchema, BREADCRUMBS } from '@/lib/seo';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Book, 
  Rocket, 
  Code, 
  Database, 
  Shield, 
  Zap,
  Palette,
  GitBranch,
  Cloud,
  Search,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const docSections = [
  {
    title: 'Getting Started',
    description: 'Learn the basics and get your first project running in minutes.',
    icon: Rocket,
    links: [
      { title: 'Quick Start Guide', href: '#' },
      { title: 'Creating Your First Project', href: '#' },
      { title: 'Understanding the Interface', href: '#' },
    ],
  },
  {
    title: 'AI Builder',
    description: 'Harness the power of AI to build applications faster.',
    icon: Zap,
    links: [
      { title: 'AI-Powered Development', href: '#' },
      { title: 'Prompt Engineering Tips', href: '#' },
      { title: 'Code Generation Best Practices', href: '#' },
    ],
  },
  {
    title: 'Components',
    description: 'Build beautiful UIs with our component library.',
    icon: Code,
    links: [
      { title: 'Component Overview', href: '#' },
      { title: 'Customizing Components', href: '#' },
      { title: 'Creating Custom Components', href: '#' },
    ],
  },
  {
    title: 'Database',
    description: 'Store and manage your application data securely.',
    icon: Database,
    links: [
      { title: 'Database Setup', href: '#' },
      { title: 'Schema Design', href: '#' },
      { title: 'Querying Data', href: '#' },
    ],
  },
  {
    title: 'Authentication',
    description: 'Secure your application with built-in auth solutions.',
    icon: Shield,
    links: [
      { title: 'Auth Overview', href: '#' },
      { title: 'Social Login Setup', href: '#' },
      { title: 'Role-Based Access', href: '#' },
    ],
  },
  {
    title: 'Design System',
    description: 'Create consistent, beautiful designs across your app.',
    icon: Palette,
    links: [
      { title: 'Theme Configuration', href: '#' },
      { title: 'Colors & Typography', href: '#' },
      { title: 'Dark Mode Support', href: '#' },
    ],
  },
  {
    title: 'Version Control',
    description: 'Track changes and collaborate with your team.',
    icon: GitBranch,
    links: [
      { title: 'GitHub Integration', href: '#' },
      { title: 'Version History', href: '#' },
      { title: 'Branching Strategy', href: '#' },
    ],
  },
  {
    title: 'Deployment',
    description: 'Deploy your applications to production with ease.',
    icon: Cloud,
    links: [
      { title: 'Deployment Options', href: '#' },
      { title: 'Custom Domains', href: '#' },
      { title: 'Environment Variables', href: '#' },
    ],
  },
];

const Documentation = () => {
  return (
    <PublicLayout>
      <SEO
        title={PAGE_SEO.documentation.title}
        description={PAGE_SEO.documentation.description}
        ogImage={PAGE_SEO.documentation.ogImage}
        keywords={PAGE_SEO.documentation.keywords as unknown as string[]}
        canonical="/docs"
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          BREADCRUMBS.docs(SEO_CONFIG.siteUrl),
        ]}
      />
      
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Book className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything you need to build amazing applications with Kernel.
          </p>
          
          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search documentation..." 
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick start banner */}
        <Card className="mb-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">New to Kernel?</h3>
                <p className="text-muted-foreground">Start with our quick start guide and build your first app in 5 minutes.</p>
              </div>
            </div>
            <Button asChild>
              <Link to="/tutorials">
                Start Tutorial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Documentation sections grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docSections.map((section) => (
            <Card key={section.title} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <a 
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <ArrowRight className="h-3 w-3" />
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Documentation;
