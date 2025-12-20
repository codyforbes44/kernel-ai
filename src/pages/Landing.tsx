import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card';
import { GlowBadge } from '@/components/ui/glow-badge';
import { SEO } from '@/components/seo/SEO';
import { PAGE_SEO, getWebsiteSchema, SEO_CONFIG, BREADCRUMBS, getOrganizationSchema, getProductSchema } from '@/lib/seo';
import { HeroBackground } from '@/components/landing/HeroBackground';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { 
  MessageSquare, 
  Code2, 
  Palette, 
  Zap, 
  Shield, 
  Users,
  ArrowRight,
  Sparkles,
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
    <PublicLayout>
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

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4">
        <HeroBackground />
        <div className="relative container mx-auto text-center max-w-4xl">
          <GlowBadge 
            variant="glow" 
            size="lg" 
            pulse 
            icon={<Sparkles className="h-4 w-4" />}
            className="mb-8"
          >
            AI-Powered Development Platform
          </GlowBadge>
          
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
            {features.map((feature, index) => (
              <GlassCard 
                key={feature.title} 
                variant="glow" 
                size="default"
                animatedBorder={index === 0}
                className="group"
              >
                <GlassCardContent>
                  <div className="h-12 w-12 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center mb-4 shadow-[0_0_15px_hsl(var(--primary)/0.2)] group-hover:shadow-[0_0_25px_hsl(var(--primary)/0.35)] transition-shadow duration-300">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCardContent>
              </GlassCard>
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
    </PublicLayout>
  );
}
