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
import { ScrollProgressIndicator } from '@/components/landing/ScrollProgressIndicator';
import { useHeroVisibility } from '@/hooks/useHeroVisibility';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { HeroContent, ScrollIndicator } from '@/components/landing/HeroContent';
import { features } from '@/lib/landing-data';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Landing() {
  const ogImageRef = useRef<HTMLDivElement>(null);
  const { heroRef, isVisible: isHeroVisible } = useHeroVisibility();
  const prefersReducedMotion = usePrefersReducedMotion();
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

      {/* Hero Section - Simplified hierarchy with accessibility support */}
      <section 
        ref={heroRef}
        id="hero" 
        className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 scroll-mt-16 pt-16 md:pt-20"
      >
        {/* 3D Background */}
        <HeroBackground isVisible={isHeroVisible && !prefersReducedMotion} />
        
        {/* Hero Content - Consolidated component */}
        <HeroContent prefersReducedMotion={prefersReducedMotion} />
        
        {/* Scroll Indicator - visible on all devices */}
        <ScrollIndicator 
          targetId="social-proof" 
          className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10"
          prefersReducedMotion={prefersReducedMotion}
        />
      </section>

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

      {/* CTA Section - Mobile optimized */}
      <HoloSection variant="gradient" className="py-12 sm:py-16 md:py-20 px-4 scroll-mt-16" id="cta">
        <div className="container mx-auto max-w-4xl text-center preserve-3d">
          <GlowText as="h2" variant="gradient" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 depth-layer-near px-2">
            Make 2026 Your Year to Build
          </GlowText>
          <p className="text-muted-foreground text-base md:text-lg mb-6 sm:mb-8 max-w-xl mx-auto px-4">
            Join thousands of developers already building the future with Kernel's AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 depth-layer-front px-4 sm:px-2">
            <Button 
              variant="gold" 
              size="lg" 
              className="w-full sm:w-auto h-14 sm:h-12 px-6 sm:px-8 text-base font-semibold depth-hover shadow-lg shadow-gold/20 active:scale-95 transition-transform touch-manipulation min-w-[200px]" 
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
              className="w-full sm:w-auto h-14 sm:h-12 px-6 sm:px-8 text-base font-semibold depth-hover active:scale-95 transition-transform touch-manipulation min-w-[200px]" 
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
