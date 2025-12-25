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
import { HeroEntranceGroup, HeroEntranceItem } from '@/components/landing/HeroEntrance';
import { ScrollProgressIndicator } from '@/components/landing/ScrollProgressIndicator';
import { useHeroVisibility } from '@/hooks/useHeroVisibility';
import { 
  PerspectiveContainer, 
  PerspectiveLayer, 
  GyroscopeUI, 
  DynamicTextShadow 
} from '@/components/landing/PerspectiveLayer';
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
  const { heroRef, isVisible: isHeroVisible } = useHeroVisibility();

  return (
    <PublicLayout>
      {/* Scroll Progress Indicator */}
      <ScrollProgressIndicator />

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

      {/* Hero Section - Mobile-first optimized with Apple Vision-inspired spatial depth */}
      <PerspectiveContainer 
        perspective={1200} 
        origin="50% 40%"
        className="relative min-h-[100dvh] md:min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center px-4 scroll-mt-16"
      >
        <section 
          ref={heroRef}
          id="hero" 
          className="relative w-full flex flex-col items-center justify-center"
        >
          <HeroBackground isVisible={isHeroVisible} />
          
          {/* Hero Content with multi-layer parallax - elevated above 3D grid */}
          <HeroEntranceGroup 
            staggerDelay={0.12}
            className="relative z-10 container mx-auto text-center max-w-4xl"
          >
            {/* Badge at foreground layer - moves most with gyroscope */}
            <HeroEntranceItem>
              <GyroscopeUI tiltIntensity={1.2} dynamicShadow>
                <PerspectiveLayer layer="foreground">
                  <GlowBadge 
                    variant="glow" 
                    size="lg" 
                    pulse 
                    icon={<Sparkles className="h-4 w-4" />}
                    className="mb-6 md:mb-8"
                  >
                    <span className="text-sm sm:text-base">2026: Build Smarter, Ship Faster 🚀</span>
                  </GlowBadge>
                </PerspectiveLayer>
              </GyroscopeUI>
            </HeroEntranceItem>
            
            {/* Headline with dynamic text shadows */}
            <HeroEntranceItem>
              <PerspectiveLayer layer="near">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6 leading-tight">
                  <DynamicTextShadow shadowColor="primary" intensity={1.5}>
                    <GlowText variant="gradient">
                      Build the Future
                    </GlowText>
                  </DynamicTextShadow>
                  <br />
                  <DynamicTextShadow shadowColor="primary" intensity={1.2}>
                    <span className="text-primary drop-shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
                      With AI at Your Side
                    </span>
                  </DynamicTextShadow>
                </h1>
              </PerspectiveLayer>
            </HeroEntranceItem>
            
            {/* Description at mid layer - improved mobile readability */}
            <HeroEntranceItem>
              <PerspectiveLayer layer="mid">
                <p className="text-base sm:text-lg md:text-xl text-foreground/80 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-4 sm:px-2 drop-shadow-[0_2px_4px_hsl(var(--background))]">
                  Transform ideas into production-ready apps in minutes. 
                  The next generation of AI-powered development starts here.
                </p>
              </PerspectiveLayer>
            </HeroEntranceItem>
            
            {/* CTA Buttons at foreground - most responsive to gyroscope */}
            <HeroEntranceItem className="w-full">
              <GyroscopeUI tiltIntensity={0.8} dynamicShadow>
                <PerspectiveLayer layer="foreground">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0 mb-4 sm:mb-0">
                    <Button 
                      variant="gold" 
                      size="lg" 
                      className="w-full sm:w-auto sm:min-w-[200px] h-14 sm:h-12 text-base font-medium shadow-lg shadow-gold/20 active:scale-95 transition-transform touch-manipulation" 
                      asChild
                    >
                      <Link to="/request-invite">
                        Start Building in 2026
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      size="lg" 
                      variant="gold-outline" 
                      className="w-full sm:w-auto sm:min-w-[200px] h-14 sm:h-12 text-base font-medium active:scale-95 transition-transform touch-manipulation" 
                      asChild
                    >
                      <Link to="/redeem-invite">
                        Have an Invite Code?
                      </Link>
                    </Button>
                  </div>
                </PerspectiveLayer>
              </GyroscopeUI>
            </HeroEntranceItem>
          </HeroEntranceGroup>
          
          {/* Scroll Down Indicator - hidden on mobile, visible on desktop */}
          <PerspectiveLayer layer="ui">
            <a 
              href="#social-proof"
              className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group z-10"
              aria-label="Scroll to features"
            >
              <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Scroll
              </span>
              <ChevronDown className="h-6 w-6 animate-bounce" />
            </a>
          </PerspectiveLayer>
        </section>
      </PerspectiveContainer>

      {/* Social Proof Section */}
      <div id="social-proof" className="scroll-mt-16">
        <SocialProofSection />
      </div>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Features Grid */}
      <HoloSection variant="gradient" className="py-12 sm:py-16 md:py-20 px-4 scroll-mt-16" id="features">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <GlowBadge variant="glow" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Features
            </GlowBadge>
            <GlowText as="h2" variant="gradient" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Build
            </GlowText>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-2">
              A complete platform for creating, managing, and deploying web applications with AI at your side.
            </p>
          </div>
          
          {/* Grid: 1 col mobile, 2 col tablet, 3 col desktop with better gap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {features.map((feature, index) => (
              <AnimatedFeatureCard 
                key={feature.title}
                icon={<feature.icon className="h-5 w-5 text-primary" />}
                title={feature.title}
                description={feature.description}
                animatedBorder={true}
                borderSpeed={3 + index * 0.5}
                variant="glow"
                delay={index * 80}
              />
            ))}
          </div>
        </div>
      </HoloSection>

      {/* Product Showcase */}
      <ProductShowcase />

      {/* Platform Comparison Section */}
      <HoloSection variant="glow" className="py-16 md:py-20 px-4 scroll-mt-16" id="comparison">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 md:mb-12">
            <GlowBadge variant="gold" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Why Choose Kernel
            </GlowBadge>
            <GlowText as="h2" variant="gradient" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              How We Stack Up
            </GlowText>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-2">
              See why developers choose Kernel over other AI platforms.
              We offer the most complete solution for modern development.
            </p>
          </div>

          <PlatformComparisonCondensed />

          <div className="text-center mt-6 md:mt-8">
            <Button variant="gold-outline" className="active:scale-95 transition-transform touch-manipulation" asChild>
              <Link to="/request-invite">
                Request Early Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </HoloSection>

      {/* CTA Section */}
      <HoloSection variant="gradient" className="py-16 md:py-20 px-4 scroll-mt-16" id="cta">
        <div className="container mx-auto max-w-4xl text-center preserve-3d">
          <GlowText as="h2" variant="gradient" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 depth-layer-near">
            Make 2026 Your Year to Build
          </GlowText>
          <p className="text-muted-foreground text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto px-2">
            Join thousands of developers already building the future with Kernel's AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 depth-layer-front px-2">
            <Button 
              variant="gold" 
              size="lg" 
              className="w-full sm:w-auto h-13 sm:h-12 px-8 text-base font-medium depth-hover shadow-lg shadow-gold/20 active:scale-95 transition-transform touch-manipulation" 
              asChild
            >
              <Link to="/request-invite">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="gold-outline" 
              className="w-full sm:w-auto h-13 sm:h-12 px-8 text-base font-medium depth-hover active:scale-95 transition-transform touch-manipulation" 
              asChild
            >
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
