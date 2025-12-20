import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SEO } from '@/components/seo/SEO';
import { PAGE_SEO, getWebsiteSchema, SEO_CONFIG, BREADCRUMBS, getOrganizationSchema, getProductSchema } from '@/lib/seo';
import { HeroBackground } from '@/components/landing/HeroBackground';
import { KernelLogo } from '@/components/ui/kernel-logo';
import { 
  MessageSquare, 
  Code2, 
  Palette, 
  Zap, 
  Shield, 
  Users,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI-Powered Chat',
    description: 'Have intelligent conversations with context-aware AI that understands your projects and helps you build faster.'
  },
  {
    icon: Code2,
    title: 'Visual Builder',
    description: 'Build and preview your applications in real-time with an integrated code editor and live preview.'
  },
  {
    icon: Palette,
    title: 'Design Systems',
    description: 'Create and manage design tokens, typography, and color palettes that stay consistent across your projects.'
  },
  {
    icon: Zap,
    title: 'Instant Deploy',
    description: 'Deploy your projects with one click. Get a live URL instantly and share your work with the world.'
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'Built-in authentication, row-level security, and encrypted data storage keep your projects safe.'
  },
  {
    icon: Users,
    title: 'Collaboration Ready',
    description: 'Work together with your team in shared workspaces. Manage projects and permissions effortlessly.'
  }
];

export default function Landing() {
  return (
    <>
      <SEO
        title={PAGE_SEO.landing.title}
        description={PAGE_SEO.landing.description}
        ogImage={PAGE_SEO.landing.ogImage}
        keywords={PAGE_SEO.landing.keywords}
        structuredData={[
          getWebsiteSchema(SEO_CONFIG.siteUrl),
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          getProductSchema(SEO_CONFIG.siteUrl),
          BREADCRUMBS.home(SEO_CONFIG.siteUrl)
        ]}
      />
      
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KernelLogo size="sm" />
              <span className="font-bold text-xl">Kernel</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?tab=signup">Get Started</Link>
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4">
          <HeroBackground />
          <div className="relative container mx-auto text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <span className="font-mono font-bold">{">_"}</span>
              <span>AI-Powered Development Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text">
              Build Beautiful Apps
              <br />
              <span className="text-primary">With AI Assistance</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              From idea to deployment in minutes. Chat with AI, build visually, 
              and launch your web applications without the complexity.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="min-w-[180px] h-12 text-base" asChild>
                <Link to="/auth?tab=signup">
                  Start Building Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="min-w-[180px] h-12 text-base" asChild>
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Build
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                A complete platform for creating, managing, and deploying web applications with AI at your side.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join thousands of developers building with AI. Create your free account and start building today.
            </p>
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/auth?tab=signup">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 py-8 px-4">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <KernelLogo size="sm" />
              <span className="font-medium">Kernel</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Kernel. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
