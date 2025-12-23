import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Check, X, Share2, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KernelLogo } from "@/components/ui/kernel-logo";
import { SocialComparisonCard } from "@/components/marketing/SocialComparisonCard";
import { platformFeatures, platforms } from "@/lib/pricing-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FeatureValue = ({ value }: { value: boolean | string }) => {
  if (value === true) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
          <X className="w-4 h-4 text-red-400" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center">
      <span className="text-xs font-medium text-amber-400 bg-amber-500/20 px-2 py-1 rounded">
        {value}
      </span>
    </div>
  );
};

const Compare = () => {
  const cardRef = useRef<HTMLDivElement>(null);

  const shareText = `🚀 Just discovered Kernel — the most complete AI development platform

✅ AI Image Generation
✅ Screenshot to UI  
✅ Real-time Cursors
✅ Design System Builder
✅ Component Marketplace
✅ One-Click Deploy

While others give you pieces, Kernel gives you everything.

Check the full comparison 👇`;

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(shareText);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const groupedFeatures = platformFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, typeof platformFeatures>);

  return (
    <>
      <Helmet>
        <title>Kernel vs Competition - AI Platform Comparison | Kernel</title>
        <meta 
          name="description" 
          content="Compare Kernel to Lovable, Bolt, v0, Replit, and Cursor. See why Kernel is the most complete AI-powered development platform." 
        />
        <meta property="og:title" content="Kernel vs Competition - Feature Comparison" />
        <meta property="og:description" content="See how Kernel stacks up against other AI development platforms." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="container relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="flex justify-center mb-6">
                <KernelLogo size="xl" glow />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Kernel vs The Competition
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                The only AI platform with everything you need to build, deploy, and scale.
              </p>
            </div>

            {/* Share Buttons */}
            <div className="flex justify-center gap-3 mb-12">
              <Button onClick={handleShareTwitter} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Share on X
              </Button>
              <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                <Share2 className="w-4 h-4" />
                Copy Link
              </Button>
            </div>

            {/* Social Card Preview */}
            <div ref={cardRef} className="flex justify-center mb-16">
              <SocialComparisonCard />
            </div>
          </div>
        </section>

        {/* Full Comparison Table */}
        <section className="py-16 border-t border-border/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Complete Feature Comparison
              </h2>
              <p className="text-muted-foreground">
                All 23 features compared across 6 platforms
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-7 gap-2 mb-4 sticky top-0 bg-background/95 backdrop-blur py-4 z-10">
                  <div className="col-span-1 font-semibold text-muted-foreground text-sm">
                    Feature
                  </div>
                  {platforms.map((platform) => (
                    <div
                      key={platform.name}
                      className={cn(
                        "text-center py-3 px-2 rounded-lg",
                        platform.name === "Kernel"
                          ? "bg-primary/20 border border-primary/40"
                          : "bg-muted/30"
                      )}
                    >
                      <span className={cn(
                        "font-semibold",
                        platform.name === "Kernel" ? "text-primary" : "text-foreground"
                      )}>
                        {platform.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Features by Category */}
                {Object.entries(groupedFeatures).map(([category, features]) => (
                  <div key={category} className="mb-6">
                    {/* Category Header */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      <div className="col-span-7 bg-muted/50 py-2 px-4 rounded-lg">
                        <span className="font-semibold text-sm text-foreground">
                          {category}
                        </span>
                      </div>
                    </div>

                    {/* Category Features */}
                    {features.map((feature, index) => (
                      <div
                        key={feature.name}
                        className={cn(
                          "grid grid-cols-7 gap-2 items-center py-3 px-4 rounded-lg transition-colors",
                          index % 2 === 0 ? "bg-muted/10" : "bg-transparent",
                          "hover:bg-muted/20"
                        )}
                      >
                        <div className="col-span-1">
                          <span className="text-sm font-medium text-foreground">
                            {feature.name}
                          </span>
                        </div>
                        <FeatureValue value={feature.kernel} />
                        <FeatureValue value={feature.lovable} />
                        <FeatureValue value={feature.bolt} />
                        <FeatureValue value={feature.v0} />
                        <FeatureValue value={feature.replit} />
                        <FeatureValue value={feature.cursor} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-8 mt-8 pt-8 border-t border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-sm text-muted-foreground">Fully Supported</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-red-400" />
                </div>
                <span className="text-sm text-muted-foreground">Not Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-amber-400 bg-amber-500/20 px-2 py-1 rounded">
                  Limited
                </span>
                <span className="text-sm text-muted-foreground">Partial Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 border-t border-border/50">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                Ready to build with the best?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of developers who chose the complete platform.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" asChild>
                  <a href="/auth">Get Started Free</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/pricing">View Pricing</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Compare;
