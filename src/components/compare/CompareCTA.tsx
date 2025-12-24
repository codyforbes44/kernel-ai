import { Button } from "@/components/ui/button";

export const CompareCTA = () => {
  return (
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
  );
};
