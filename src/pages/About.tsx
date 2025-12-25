import { Link } from "react-router-dom";
import { 
  Lightbulb, 
  Zap, 
  Users, 
  Heart, 
  ArrowRight,
  Rocket,
  Code2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SEO } from "@/components/seo/SEO";
import { SEO_CONFIG, PAGE_SEO, getOrganizationSchema, getBreadcrumbSchema, BREADCRUMBS } from "@/lib/seo";
import { XLogo } from "@/components/ui/x-logo";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation First",
    description: "We push boundaries to create tools that redefine how developers build software.",
  },
  {
    icon: Zap,
    title: "Speed Matters",
    description: "Every feature we build is optimized for developer velocity and productivity.",
  },
  {
    icon: Users,
    title: "Developer-Centric",
    description: "Built by developers, for developers. Your workflow is our priority.",
  },
  {
    icon: Heart,
    title: "Community Driven",
    description: "We listen, learn, and grow together with our vibrant developer community.",
  },
];

const milestones = [
  {
    year: "2023",
    title: "The Spark",
    description: "Kernel was born from a simple idea: what if AI could truly understand and accelerate the development process?",
  },
  {
    year: "2024",
    title: "Rapid Growth",
    description: "Developers joined our platform, building everything from MVPs to production applications.",
  },
  {
    year: "2025",
    title: "Breaking Barriers",
    description: "Launched advanced AI features and expanded our developer community globally.",
  },
  {
    year: "2026",
    title: "The Future is Now",
    description: "Pioneering the next generation of AI-powered development tools and experiences.",
  },
];

// Team section data removed - will be populated with real team data when available

export default function About() {
  return (
    <PublicLayout backgroundIntensity="medium">
      <SEO 
        title={PAGE_SEO.about.title}
        description={PAGE_SEO.about.description}
        ogImage={PAGE_SEO.about.ogImage}
        keywords={PAGE_SEO.about.keywords as unknown as string[]}
        canonical="/about"
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          BREADCRUMBS.about(SEO_CONFIG.siteUrl),
        ]}
      />

      {/* Hero - Mission Statement */}
      <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4 bg-primary/10 border-primary/30">
            Our Mission
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
            Empowering developers to{" "}
            <span className="text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]">build faster</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to democratize software development. By combining 
            cutting-edge AI with intuitive design, we're making it possible for 
            anyone to bring their ideas to life in 2026 and beyond.
          </p>
        </div>
      </section>


      {/* Story Section */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Our Story
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From idea to reality
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every great company starts with a simple observation. Ours was that 
              developers spend too much time on repetitive tasks instead of creating.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 perspective-container">
            {milestones.map((milestone, index) => (
              <Card 
                key={milestone.year} 
                className="relative overflow-hidden group depth-card"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `translateZ(${index * -10}px)`,
                }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/20" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {index === 0 && <Sparkles className="h-5 w-5 text-primary" />}
                      {index === 1 && <Code2 className="h-5 w-5 text-primary" />}
                      {index === 2 && <Zap className="h-5 w-5 text-primary" />}
                      {index === 3 && <Rocket className="h-5 w-5 text-primary" />}
                    </div>
                    <Badge variant="outline">{milestone.year}</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {milestone.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="pb-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl py-16">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Our Values
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What drives us forward
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide every decision we make and every feature we build.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 preserve-3d">
            {values.map((value, index) => (
              <Card 
                key={value.title} 
                className="group hover:border-primary/50 transition-all depth-hover"
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                <CardContent className="p-6 flex gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 h-fit shrink-0 group-hover:bg-primary/20 transition-colors">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {value.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - Hidden pending updates */}
      {/* TODO: Uncomment when team content is ready
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Our Team
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet the people behind Kernel
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A passionate team of engineers, designers, and dreamers united by a 
              common goal: making development accessible to everyone.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <Card key={member.name} className="group text-center">
                <CardContent className="p-6">
                  <Avatar className="h-24 w-24 mx-auto mb-4 ring-2 ring-border group-hover:ring-primary/50 transition-all">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {member.bio}
                  </p>
                  <a
                    href={member.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <XLogo className="h-4 w-4" />
                    <span>Follow</span>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* CTA Section */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-border p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join us on our journey
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Whether you're building your first app or your hundredth, we're here 
              to help you succeed. Start building with Kernel today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" asChild>
                <Link to="/auth">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="gold-outline" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
