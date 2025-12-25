import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatedFeatureCard } from '@/components/landing/AnimatedFeatureCard';
import { GlowBadge } from '@/components/ui/glow-badge';
import { GlowText } from '@/components/ui/glow-text';
import { HoloSection } from '@/components/ui/holo-section';
import { SEO } from '@/components/seo/SEO';
import { PAGE_SEO, getWebsiteSchema, SEO_CONFIG, BREADCRUMBS, getOrganizationSchema, getProductSchema } from '@/lib/seo';
import { HeroBackground } from '@/components/landing/HeroBackground';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { BackToTopButton } from '@/components/ui/back-to-top-button';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { HomepageOGImage } from '@/components/marketing/HomepageOGImage';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ProductShowcase } from '@/components/landing/ProductShowcase';
import { PlatformComparisonCondensed } from '@/components/pricing/PlatformComparisonChart';
import { 
  MessageSquare, 
  Code2, 
  Palette, 
  Zap, 
  Shield, 
  Users,
  ArrowRight,
  Sparkles,
  ChevronDown,
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
  const ogImageRef = useRef<HTMLDivElement>(null);

  return (
    <PublicLayout>
      {/* Hidden OG Image Component for Dynamic Generation */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <HomepageOGImage ref={ogImageRef} />
      </div>
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
      <section id="hero" className="relative min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center px-4 scroll-mt-16 perspective-container">
        <HeroBackground />
        <div className="relative container mx-auto text-center max-w-4xl preserve-3d">
          <GlowBadge 
            variant="glow" 
            size="lg" 
            pulse 
            icon={<Sparkles className="h-4 w-4" />}
            className="mb-8 relative z-20 depth-hover"
          >
            <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
              <span className="text-sm sm:text-base">2026: Build Smarter, Ship Faster 🚀</span>
              <span className="hidden sm:inline opacity-50">•</span>
              <span className="hidden xs:inline text-sm">
                Request your invite today
              </span>
            </span>
          </GlowBadge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 depth-layer-front">
            <GlowText variant="gradient">
              Build the Future
            </GlowText>
            <br />
            <span className="text-primary drop-shadow-[0_0_20px_hsl(var(--primary)/0.5)]">With AI at Your Side</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed depth-layer-near">
            Transform ideas into production-ready apps in minutes. 
            The next generation of AI-powered development starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0 depth-layer-front">
            <Button variant="gold" size="lg" className="w-full sm:w-auto sm:min-w-[180px] h-12 text-base depth-hover shadow-lg shadow-gold/20" asChild>
              <Link to="/request-invite">
                Start Building in 2026
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="gold-outline" className="w-full sm:w-auto sm:min-w-[180px] h-12 text-base depth-hover" asChild>
              <Link to="/redeem-invite">
                Have an Invite Code?
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Scroll Down Indicator */}
        <a 
          href="#social-proof"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          aria-label="Scroll to features"
        >
          <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Scroll</span>
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </a>
      </section>

      {/* Social Proof Section */}
      <div id="social-proof" className="scroll-mt-16">
        <SocialProofSection />
      </div>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Features Grid */}
      <HoloSection variant="gradient" className="py-20 px-4 scroll-mt-16" id="features">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <GlowBadge variant="glow" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Features
            </GlowBadge>
            <GlowText as="h2" variant="gradient" className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Build
            </GlowText>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete platform for creating, managing, and deploying web applications with AI at your side.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <AnimatedFeatureCard 
                key={feature.title}
                icon={<feature.icon className="h-6 w-6 text-primary" />}
                title={feature.title}
                description={feature.description}
                animatedBorder={true}
                borderSpeed={3 + index * 0.5}
                variant="glow"
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </HoloSection>

      {/* Product Showcase */}
      <ProductShowcase />

      {/* Platform Comparison Section */}
      <HoloSection variant="glow" className="py-20 px-4 scroll-mt-16" id="comparison">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <GlowBadge variant="gold" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Why Choose Kernel
            </GlowBadge>
            <GlowText as="h2" variant="gradient" className="text-3xl md:text-4xl font-bold mb-4">
              How We Stack Up
            </GlowText>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See why developers choose Kernel over other AI platforms.
              We offer the most complete solution for modern development.
            </p>
          </div>

          <PlatformComparisonCondensed />

          <div className="text-center mt-8">
            <Button variant="gold-outline" asChild>
              <Link to="/request-invite">
                Request Early Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </HoloSection>

      {/* CTA Section */}
      <HoloSection variant="gradient" className="py-20 px-4 scroll-mt-16" id="cta">
        <div className="container mx-auto max-w-4xl text-center preserve-3d">
          <GlowText as="h2" variant="gradient" className="text-3xl md:text-4xl font-bold mb-4 depth-layer-near">
            Make 2026 Your Year to Build
          </GlowText>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join thousands of developers already building the future with Kernel's AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 depth-layer-front">
            <Button variant="gold" size="lg" className="h-12 px-8 text-base depth-hover shadow-lg shadow-gold/20" asChild>
              <Link to="/request-invite">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="gold-outline" className="h-12 px-8 text-base depth-hover" asChild>
              <Link to="/redeem-invite">
                Redeem Invite Code
              </Link>
            </Button>
          </div>
        </div>
      </HoloSection>

      <BackToTopButton />
    </PublicLayout>
  );
}
