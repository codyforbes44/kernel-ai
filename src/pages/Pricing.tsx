import { Check, X, Zap, Crown, Building2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KernelLogo } from "@/components/ui/kernel-logo";
import { SEO } from "@/components/seo/SEO";
import { SEO_CONFIG, getOrganizationSchema, getProductSchema } from "@/lib/seo";

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out Kernel",
    price: "$0",
    period: "forever",
    icon: Zap,
    highlight: false,
    cta: "Get Started",
    ctaVariant: "outline" as const,
    features: [
      "5 AI conversations/day",
      "Basic code generation",
      "Community support",
      "1 project",
      "Standard response time",
    ],
  },
  {
    name: "Pro",
    description: "For professionals and power users",
    price: "$19",
    period: "/month",
    icon: Crown,
    highlight: true,
    cta: "Start Pro Trial",
    ctaVariant: "default" as const,
    badge: "Most Popular",
    features: [
      "Unlimited AI conversations",
      "Advanced code generation",
      "Priority support",
      "Unlimited projects",
      "Faster response time",
      "Custom templates",
      "API access",
      "Team collaboration",
    ],
  },
  {
    name: "Enterprise",
    description: "For teams and organizations",
    price: "Custom",
    period: "",
    icon: Building2,
    highlight: false,
    cta: "Contact Sales",
    ctaVariant: "secondary" as const,
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom integrations",
      "SSO & SAML",
      "Advanced security",
      "SLA guarantee",
      "Custom training",
      "On-premise option",
    ],
  },
];

const comparisonFeatures = [
  { category: "AI Features", features: [
    { name: "AI conversations", free: "5/day", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "Code generation", free: "Basic", pro: "Advanced", enterprise: "Advanced + Custom" },
    { name: "Context awareness", free: true, pro: true, enterprise: true },
    { name: "Multi-file editing", free: false, pro: true, enterprise: true },
    { name: "Custom AI training", free: false, pro: false, enterprise: true },
  ]},
  { category: "Projects", features: [
    { name: "Number of projects", free: "1", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "Collaborators per project", free: "1", pro: "10", enterprise: "Unlimited" },
    { name: "Version history", free: "7 days", pro: "90 days", enterprise: "Unlimited" },
    { name: "Custom domains", free: false, pro: true, enterprise: true },
    { name: "White-label exports", free: false, pro: false, enterprise: true },
  ]},
  { category: "Support", features: [
    { name: "Community support", free: true, pro: true, enterprise: true },
    { name: "Email support", free: false, pro: true, enterprise: true },
    { name: "Priority support", free: false, pro: true, enterprise: true },
    { name: "Dedicated account manager", free: false, pro: false, enterprise: true },
    { name: "SLA guarantee", free: false, pro: false, enterprise: true },
  ]},
  { category: "Security & Compliance", features: [
    { name: "2FA authentication", free: true, pro: true, enterprise: true },
    { name: "SSO / SAML", free: false, pro: false, enterprise: true },
    { name: "Audit logs", free: false, pro: true, enterprise: true },
    { name: "SOC 2 compliance", free: false, pro: false, enterprise: true },
    { name: "On-premise deployment", free: false, pro: false, enterprise: true },
  ]},
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-primary mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
    );
  }
  return <span className="text-foreground">{value}</span>;
}

export default function Pricing() {
  const pricingSeo = {
    title: "Pricing - Kernel",
    description: "Choose the perfect Kernel plan for your needs. From free tier to enterprise solutions with advanced AI code generation.",
    keywords: ["pricing", "plans", "subscription", "AI coding", "developer tools"],
  };

  return (
    <>
      <SEO 
        {...pricingSeo}
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          getProductSchema(SEO_CONFIG.siteUrl),
        ]}
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <KernelLogo size="sm" />
              <span className="font-bold text-xl">Kernel</span>
            </Link>
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
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              Simple, transparent pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Choose your <span className="text-primary">Kernel</span> plan
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Start for free, upgrade as you grow. All plans include our core AI-powered 
              development features with no hidden fees.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <Card 
                  key={plan.name}
                  className={`relative flex flex-col ${
                    plan.highlight 
                      ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]" 
                      : "border-border"
                  }`}
                >
                  {plan.badge && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      {plan.badge}
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 rounded-xl bg-primary/10 w-fit">
                      <plan.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-6 flex-grow">
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 text-left">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={plan.ctaVariant} 
                      className="w-full" 
                      asChild
                    >
                      <Link to={plan.name === "Enterprise" ? "#contact" : "/auth?tab=signup"}>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="pb-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Compare all features
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See exactly what's included in each plan to find the perfect fit for your needs.
              </p>
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[40%]">Feature</TableHead>
                    <TableHead className="text-center">Free</TableHead>
                    <TableHead className="text-center bg-primary/5">Pro</TableHead>
                    <TableHead className="text-center">Enterprise</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonFeatures.map((category) => (
                    <>
                      <TableRow key={category.category} className="bg-muted/30">
                        <TableCell colSpan={4} className="font-semibold text-foreground">
                          {category.category}
                        </TableCell>
                      </TableRow>
                      {category.features.map((feature) => (
                        <TableRow key={feature.name}>
                          <TableCell className="text-muted-foreground">
                            {feature.name}
                          </TableCell>
                          <TableCell className="text-center">
                            <FeatureValue value={feature.free} />
                          </TableCell>
                          <TableCell className="text-center bg-primary/5">
                            <FeatureValue value={feature.pro} />
                          </TableCell>
                          <TableCell className="text-center">
                            <FeatureValue value={feature.enterprise} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pb-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently asked questions
              </h2>
            </div>
            <div className="space-y-6">
              {[
                {
                  q: "Can I switch plans anytime?",
                  a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges."
                },
                {
                  q: "What happens when I hit my conversation limit?",
                  a: "On the Free plan, you'll need to wait until the next day for your limit to reset. Consider upgrading to Pro for unlimited conversations."
                },
                {
                  q: "Is there a free trial for Pro?",
                  a: "Yes, Pro comes with a 14-day free trial. No credit card required to start."
                },
                {
                  q: "Do you offer discounts for startups or students?",
                  a: "Yes! We offer special pricing for qualified startups and educational institutions. Contact our sales team for details."
                },
              ].map((faq) => (
                <div key={faq.q} className="border border-border rounded-lg p-6 bg-card">
                  <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-border p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to build faster?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of developers who are already using Kernel to accelerate their development workflow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/auth?tab=signup">
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-4">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <KernelLogo size="sm" />
              <span className="font-semibold">Kernel</span>
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
