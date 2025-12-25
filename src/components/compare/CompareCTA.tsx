import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { GlowText } from "@/components/ui/glow-text";

export const CompareCTA = () => {
  return (
    <section className="py-16 md:py-20 border-t border-border/50 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <Crown className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">100% Feature Coverage</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            <GlowText variant="gradient" as="span">
              Stop Compromising.
            </GlowText>
            <br />
            <span className="text-foreground">Get Everything.</span>
          </h2>
          
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            While others give you pieces, Kernel gives you the complete platform.
            Join developers who refuse to settle for less.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8">
            <Button size="lg" asChild className="w-full sm:w-auto group">
              <Link to="/request-invite">
                <Zap className="mr-2 h-4 w-4" />
                Get Everything Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/redeem-invite">Redeem Invite Code</Link>
            </Button>
          </div>

          {/* Trust indicator */}
          <p className="text-xs text-muted-foreground">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};
