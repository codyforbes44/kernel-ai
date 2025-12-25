import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CompareCTA = () => {
  return (
    <section className="py-12 md:py-16 border-t border-border/50">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Ready to build with the best?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
            Join thousands of developers who chose the complete platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link to="/request-invite">
                Request Early Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/redeem-invite">Redeem Invite Code</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
