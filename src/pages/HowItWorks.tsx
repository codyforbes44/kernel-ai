import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Wand2, 
  Rocket, 
  Eye,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Globe,
  Sparkles,
  Code2,
  Palette,
  Database
} from "lucide-react";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { HoloSection } from "@/components/ui/holo-section";
import { GlowText } from "@/components/ui/glow-text";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { SEO_CONFIG, PAGE_SEO, getHowToSchema, BREADCRUMBS, getOrganizationSchema, getFAQSchema } from "@/lib/seo";
import { HowItWorksVideo } from "@/components/landing/HowItWorksVideo";

const mainSteps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "Describe Your Vision",
    description: "Start a conversation with Kernel AI. Describe what you want to build in plain English—no coding experience required.",
    features: [
      "Natural language understanding",
      "Upload images for reference",
      "Describe features, not code",
      "Context-aware suggestions"
    ]
  },
  {
    icon: Wand2,
    step: "02",
    title: "AI Generates Code",
    description: "Watch as Kernel transforms your ideas into production-ready code in real-time. See your app take shape instantly.",
    features: [
      "Real-time code generation",
      "Live preview updates",
      "Modern React + TypeScript",
      "Automatic best practices"
    ]
  },
  {
    icon: Eye,
    step: "03",
    title: "Refine & Iterate",
    description: "Use visual editing tools to fine-tune your creation. Point, click, and describe changes—Kernel handles the rest.",
    features: [
      "Visual selection editing",
      "Component library access",
      "Design system integration",
      "Instant modifications"
    ]
  },
  {
    icon: Rocket,
    step: "04",
    title: "Deploy Instantly",
    description: "One click to go live. Your app is deployed with HTTPS, custom domains, and global CDN—ready for the world.",
    features: [
      "One-click deployment",
      "Custom domain support",
      "Automatic HTTPS",
      "Global CDN distribution"
    ]
  },
];

const capabilities = [
  {
    icon: Code2,
    title: "Full-Stack Generation",
    description: "Frontend, backend, database—Kernel generates everything you need for a complete application."
  },
  {
    icon: Palette,
    title: "Beautiful by Default",
    description: "Every app comes with responsive, accessible design that looks professional from day one."
  },
  {
    icon: Database,
    title: "Built-in Backend",
    description: "User authentication, database, file storage—backend features are just a conversation away."
  },
  {
    icon: Sparkles,
    title: "AI-Powered Features",
    description: "Add AI capabilities like chat, image analysis, and content generation without any API setup."
  }
];

const comparisonPoints = [
  { traditional: "Weeks of coding", kernel: "Minutes of conversation", icon: Clock },
  { traditional: "Technical expertise required", kernel: "Natural language interface", icon: Users },
  { traditional: "Complex deployment setup", kernel: "One-click deployment", icon: Globe },
];

export default function HowItWorks() {
  return (
    <>
      <SEOHead
        title="How Kernel Works — Build Apps in 4 Steps"
        description="Transform ideas into deployed apps in minutes. Describe your vision, watch AI generate code, refine visually, and deploy instantly."
        canonical="/how-it-works"
        keywords={['AI development', 'how it works', 'code generation', 'no-code', 'app builder', 'deploy']}
        breadcrumbs={[
          { name: 'Home', url: SEO_CONFIG.siteUrl },
          { name: 'How It Works', url: `${SEO_CONFIG.siteUrl}/how-it-works` },
        ]}
        speakable={{ cssSelectors: ['h1', '.step-description'] }}
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          getHowToSchema({
            name: 'How to Build an App with Kernel AI',
            description: 'Build production-ready web applications using AI-powered development in four simple steps.',
            totalTime: 'PT10M',
            steps: mainSteps.map(s => ({ name: s.title, text: s.description })),
          }, SEO_CONFIG.siteUrl),
        ]}
      />
      
      <PublicHeader />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <HoloSection variant="gradient" className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                The Future of Development
              </span>
              
              <GlowText as="h1" variant="gradient" className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                How Kernel Works
              </GlowText>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                From idea to deployed application in minutes, not months. 
                Kernel's AI understands what you want to build and makes it happen.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="h-12 px-8 min-w-[180px] touch-manipulation active:scale-95 transition-transform">
                  <Link to="/request-invite">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 min-w-[180px] touch-manipulation active:scale-95 transition-transform"
                  onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </HoloSection>

        {/* Video Player Demo Section */}
        <section className="py-12 sm:py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <GlowText as="h2" variant="gradient" className="text-2xl sm:text-3xl font-bold mb-3">
                See It in Action
              </GlowText>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
                Watch Kernel build an app from a simple conversation
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <HowItWorksVideo />
            </motion.div>
          </div>
        </section>

        {/* Dive Deeper Transition */}
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <div className="h-px w-12 bg-border" />
            <span>Dive deeper</span>
            <div className="h-px w-12 bg-border" />
          </div>
        </div>

        {/* Main Steps Section */}
        <section className="py-16 sm:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <GlowText as="h2" variant="gradient" className="text-3xl sm:text-4xl font-bold mb-4">
                Four Steps to Launch
              </GlowText>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Building with Kernel is as easy as having a conversation
              </p>
            </motion.div>

            <div className="space-y-8 sm:space-y-12">
              {mainSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassPanel 
                    variant="bordered" 
                    className={`p-6 sm:p-8 ${index % 2 === 0 ? '' : 'sm:flex-row-reverse'}`}
                  >
                    <div className={`flex flex-col sm:flex-row gap-6 sm:gap-8 ${index % 2 === 0 ? '' : 'sm:flex-row-reverse'}`}>
                      {/* Icon and Step Number */}
                      <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-4">
                        <div 
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/30"
                          style={{
                            boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.4)',
                          }}
                        >
                          <step.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                        </div>
                        <span className="text-4xl sm:text-5xl font-bold text-primary/20">
                          {step.step}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-semibold mb-3">{step.title}</h3>
                        <p className="text-muted-foreground mb-4 sm:mb-6">{step.description}</p>
                        
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {step.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <HoloSection variant="glow" className="py-16 sm:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <GlowText as="h2" variant="gradient" className="text-3xl sm:text-4xl font-bold mb-4">
                What You Can Build
              </GlowText>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Kernel handles the complexity so you can focus on your vision
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {capabilities.map((capability, index) => (
                <motion.div
                  key={capability.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassPanel variant="glow" className="p-6 h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <capability.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{capability.title}</h3>
                        <p className="text-muted-foreground text-sm">{capability.description}</p>
                      </div>
                    </div>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </div>
        </HoloSection>

        {/* Comparison Section */}
        <section className="py-16 sm:py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <GlowText as="h2" variant="gradient" className="text-3xl sm:text-4xl font-bold mb-4">
                Traditional vs Kernel
              </GlowText>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                See how Kernel transforms the development experience
              </p>
            </motion.div>

            <div className="space-y-4">
              {comparisonPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassPanel variant="bordered" className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <point.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center sm:text-left">
                        <div className="text-muted-foreground line-through opacity-60">
                          {point.traditional}
                        </div>
                        <div className="font-medium text-primary">
                          {point.kernel}
                        </div>
                      </div>
                    </div>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <HoloSection variant="gradient" className="py-16 sm:py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <GlowText as="h2" variant="gradient" className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Build Something Amazing?
              </GlowText>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Join thousands of creators who are building the future with Kernel.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="h-14 px-8 min-w-[200px] font-semibold touch-manipulation active:scale-95 transition-transform">
                  <Link to="/request-invite">
                    Request Early Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 min-w-[200px] font-semibold touch-manipulation active:scale-95 transition-transform">
                  <Link to="/redeem-invite">
                    Have an Invite Code?
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </HoloSection>
      </main>
      
      <PublicFooter />
    </>
  );
}
