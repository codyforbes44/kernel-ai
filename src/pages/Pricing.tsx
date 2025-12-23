import { useState, useEffect } from "react";
import { Check, X, ArrowRight, Loader2, Zap, Shield, BarChart3, Palette, Globe, Headphones } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FAQSection } from "@/components/faq/FAQSection";
import { SEO } from "@/components/seo/SEO";
import { SEO_CONFIG, PAGE_SEO, getOrganizationSchema, getServiceSchema, BREADCRUMBS } from "@/lib/seo";
import { plans, comparisonFeatures } from "@/lib/pricing-data";
import { PlatformComparisonChart } from "@/components/pricing/PlatformComparisonChart";
import { pricingFAQs } from "@/lib/faq-data";
import { useSubscription, STRIPE_PRICES } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { PremiumFeatureCard, PremiumFeatureGrid } from "@/components/ui/premium-feature-card";
import { PremiumUpgradeModal, usePremiumUpgradeModal } from "@/components/ui/premium-upgrade-modal";

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

function PriceDisplay({ plan, isYearly }: { plan: typeof plans[0]; isYearly: boolean }) {
  if (plan.monthlyPrice === null) {
    return (
      <div className="mb-6">
        <span className="text-4xl font-bold">Custom</span>
      </div>
    );
  }

  if (plan.monthlyPrice === 0) {
    return (
      <div className="mb-6">
        <span className="text-4xl font-bold">$0</span>
        <span className="text-muted-foreground"> forever</span>
      </div>
    );
  }

  const monthlyEquivalent = isYearly ? Math.round(plan.yearlyPrice! / 12) : plan.monthlyPrice;
  const savings = isYearly ? Math.round((1 - plan.yearlyPrice! / (plan.monthlyPrice * 12)) * 100) : 0;

  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-4xl font-bold">${monthlyEquivalent}</span>
        <span className="text-muted-foreground">/month</span>
      </div>
      {isYearly && (
        <div className="mt-2 space-y-1">
          <p className="text-sm text-muted-foreground">
            ${plan.yearlyPrice}/year
          </p>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
            Save {savings}%
          </Badge>
        </div>
      )}
      {!isYearly && (
        <p className="text-sm text-muted-foreground mt-2">
          Billed monthly
        </p>
      )}
    </div>
  );
}

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { plan: currentPlan, subscribed, createCheckoutSession } = useSubscription();

  // Check if user is on free plan (not subscribed or no user)
  const isFreePlan = !subscribed;
  
  // Premium upgrade modal
  const { isOpen: isUpgradeModalOpen, featureName, openModal, setIsOpen: setUpgradeModalOpen } = usePremiumUpgradeModal();

  const handleUpgrade = (feature?: string) => {
    if (!user) {
      toast.info('Please sign in to upgrade');
      return;
    }
    if (isFreePlan && feature) {
      openModal(feature);
    } else {
      const priceId = isYearly ? STRIPE_PRICES.PRO_YEARLY : STRIPE_PRICES.PRO_MONTHLY;
      createCheckoutSession(priceId);
    }
  };

  const handleCheckoutFromModal = () => {
    const priceId = isYearly ? STRIPE_PRICES.PRO_YEARLY : STRIPE_PRICES.PRO_MONTHLY;
    createCheckoutSession(priceId);
  };

  // Handle checkout canceled state
  useEffect(() => {
    if (searchParams.get('checkout') === 'canceled') {
      toast.info('Checkout was canceled. You can try again anytime.');
    }
  }, [searchParams]);

  const handleSubscribe = async (planName: string) => {
    if (planName === "Enterprise") {
      return; // Contact sales link handles this
    }

    if (planName === "Free") {
      return; // Free plan doesn't need checkout
    }

    if (!user) {
      toast.info('Please sign in to subscribe');
      return;
    }

    setIsLoading(planName);
    try {
      const priceId = isYearly ? STRIPE_PRICES.PRO_YEARLY : STRIPE_PRICES.PRO_MONTHLY;
      await createCheckoutSession(priceId);
    } finally {
      setIsLoading(null);
    }
  };

  const getButtonContent = (plan: typeof plans[0]) => {
    const isCurrentPlan = (plan.name === "Free" && !subscribed) || 
                          (plan.name === "Pro" && subscribed);
    
    if (isCurrentPlan) {
      return {
        text: "Current Plan",
        disabled: true,
        variant: "outline" as const,
      };
    }

    if (plan.name === "Pro" && !subscribed) {
      return {
        text: isLoading === plan.name ? "Loading..." : plan.cta,
        disabled: isLoading === plan.name,
        variant: "default" as const,
      };
    }

    return {
      text: plan.cta,
      disabled: false,
      variant: plan.popular ? "default" as const : "outline" as const,
    };
  };

  const pricingPlans = plans.map(plan => ({
    name: plan.name,
    description: plan.description,
    price: plan.monthlyPrice || 0,
    currency: 'USD',
    billingPeriod: 'month' as const,
    features: plan.features.filter(f => f.included).map(f => f.text),
  }));

  return (
    <PublicLayout>
      <SEO 
        title={PAGE_SEO.pricing.title}
        description={PAGE_SEO.pricing.description}
        ogImage={PAGE_SEO.pricing.ogImage}
        keywords={PAGE_SEO.pricing.keywords as unknown as string[]}
        canonical="/pricing"
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          getServiceSchema(pricingPlans, SEO_CONFIG.siteUrl),
          BREADCRUMBS.pricing(SEO_CONFIG.siteUrl),
        ]}
      />

      {/* Hero Section */}
      <section className="pt-16 pb-8 px-4">
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

      {/* Billing Toggle */}
      <section className="pb-8 px-4">
        <div className="container mx-auto flex justify-center">
          <div className="inline-flex items-center gap-4 p-2 rounded-full bg-muted/50 border border-border">
            <span className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
              !isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              aria-label="Toggle annual billing"
            />
            <span className={`text-sm font-medium px-3 py-1 rounded-full transition-colors flex items-center gap-2 ${
              isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}>
              Yearly
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
                Save 17%
              </Badge>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const buttonContent = getButtonContent(plan);
              const isCurrentPlan = (plan.name === "Free" && !subscribed) || 
                                    (plan.name === "Pro" && subscribed);

              return (
                <Card 
                  key={plan.name}
                  className={`relative flex flex-col ${
                    plan.popular 
                      ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]" 
                      : "border-border"
                  } ${isCurrentPlan ? "ring-2 ring-primary/50" : ""}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-gold-foreground border-gold/50 shadow-[0_0_12px_hsl(var(--gold)/0.4)]">
                      Most Popular
                    </Badge>
                  )}
                  {isCurrentPlan && user && (
                    <Badge variant="secondary" className="absolute -top-3 right-4 bg-gold/20 text-gold border border-gold/30">
                      Your Plan
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
                    <PriceDisplay plan={plan} isYearly={isYearly} />
                    <ul className="space-y-3 text-left">
                      {plan.features.map((feature) => (
                        <li key={feature.text} className="flex items-center gap-3">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                          )}
                          <span className={`text-sm ${feature.included ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {plan.name === "Enterprise" ? (
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/contact">
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : plan.name === "Free" ? (
                      <Button 
                        variant={buttonContent.variant} 
                        className="w-full" 
                        disabled={buttonContent.disabled}
                        asChild={!buttonContent.disabled}
                      >
                        {buttonContent.disabled ? (
                          <span>{buttonContent.text}</span>
                        ) : (
                          <Link to="/auth?mode=signup">
                            {buttonContent.text}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        variant={plan.name === "Pro" ? "gold" : buttonContent.variant}
                        className="w-full" 
                        disabled={buttonContent.disabled || isLoading === plan.name}
                        onClick={() => handleSubscribe(plan.name)}
                      >
                        {isLoading === plan.name ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            {buttonContent.text}
                            {!buttonContent.disabled && <ArrowRight className="ml-2 h-4 w-4" />}
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pro Features Showcase */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gold/10 text-gold border-gold/30">Pro Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Unlock your full potential
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pro members get access to advanced features that supercharge their development workflow.
            </p>
          </div>

          <PremiumFeatureGrid>
            <PremiumFeatureCard
              title="AI Code Generation"
              description="Advanced AI models for smarter code"
              icon={<Zap className="h-5 w-5" />}
              features={[
                "GPT-4 & Claude 3 access",
                "Context-aware completions",
                "Multi-file refactoring",
              ]}
              locked={isFreePlan}
              onUpgrade={() => handleUpgrade("AI Code Generation")}
            />
            <PremiumFeatureCard
              title="Advanced Security"
              description="Enterprise-grade protection"
              icon={<Shield className="h-5 w-5" />}
              features={[
                "SOC 2 compliance",
                "Audit logs",
                "SSO integration",
              ]}
              locked={isFreePlan}
              onUpgrade={() => handleUpgrade("Advanced Security")}
            />
            <PremiumFeatureCard
              title="Analytics Dashboard"
              description="Deep insights into your apps"
              icon={<BarChart3 className="h-5 w-5" />}
              features={[
                "Real-time metrics",
                "Custom reports",
                "Performance tracking",
              ]}
              locked={isFreePlan}
              onUpgrade={() => handleUpgrade("Analytics Dashboard")}
            />
            <PremiumFeatureCard
              title="Custom Themes"
              description="Full design system control"
              icon={<Palette className="h-5 w-5" />}
              features={[
                "Unlimited themes",
                "Brand kit sync",
                "Export to Figma",
              ]}
              locked={isFreePlan}
              onUpgrade={() => handleUpgrade("Custom Themes")}
            />
            <PremiumFeatureCard
              title="Custom Domains"
              description="Your brand, your domain"
              icon={<Globe className="h-5 w-5" />}
              features={[
                "Unlimited domains",
                "Auto SSL certificates",
                "CDN included",
              ]}
              locked={isFreePlan}
              onUpgrade={() => handleUpgrade("Custom Domains")}
            />
            <PremiumFeatureCard
              title="Priority Support"
              description="Get help when you need it"
              icon={<Headphones className="h-5 w-5" />}
              features={[
                "24/7 chat support",
                "1-hour response time",
                "Dedicated account manager",
              ]}
              locked={isFreePlan}
              onUpgrade={() => handleUpgrade("Priority Support")}
            />
          </PremiumFeatureGrid>
        </div>
      </section>
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
                {comparisonFeatures.map((feature) => (
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
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Platform Comparison Section */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              See how we compare
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kernel vs. The Competition
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how Kernel stacks up against other AI development platforms. 
              We're building the most complete solution for modern developers.
            </p>
          </div>

          <PlatformComparisonChart />
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection faqs={pricingFAQs} />

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
                <Link to="/auth?mode=signup">
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

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        open={isUpgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        featureName={featureName}
        onUpgrade={handleCheckoutFromModal}
      />
    </PublicLayout>
  );
}
