import { motion } from "framer-motion";
import { MessageSquare, Wand2, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { HoloSection } from "@/components/ui/holo-section";
import { GlowText } from "@/components/ui/glow-text";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { HowItWorksVideo } from "./HowItWorksVideo";

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "Describe Your Vision",
    description: "Chat naturally with AI about what you want to build. No technical jargon needed.",
  },
  {
    icon: Wand2,
    step: "02",
    title: "Watch It Come to Life",
    description: "AI generates production-ready code in real-time as you refine your ideas.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Deploy Instantly",
    description: "One click to launch. Share your creation with the world in seconds.",
  },
];

export function HowItWorksSection() {
  return (
    <HoloSection id="how-it-works" variant="gradient" className="py-12 sm:py-16 md:py-20 px-4">
      <div className="container mx-auto max-w-5xl preserve-3d">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <GlowText as="h2" variant="gradient" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            How It Works
          </GlowText>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-2">
            From idea to deployed app in three simple steps
          </p>
        </motion.div>

        <div className="relative preserve-3d">
          {/* 3D Connection Line */}
          <div 
            className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent -translate-y-1/2"
            style={{ 
              transform: 'translateZ(-20px) translateY(-50%)',
              boxShadow: '0 0 20px hsl(var(--primary) / 0.3)',
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ 
                  y: -10,
                  rotateX: 5,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="relative"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: `translateZ(${(2 - index) * -15}px)`,
                }}
              >
                <GlassPanel 
                  variant="glow" 
                  className="text-center p-5 sm:p-6 h-full touch-manipulation"
                >
                  {/* Step number badge with depth glow */}
                  <div className="relative inline-block mb-4 sm:mb-6">
                    <div 
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto border border-primary/30"
                      style={{
                        boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.4), 0 0 20px hsl(var(--primary) / 0.2)',
                      }}
                    >
                      <step.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                    </div>
                    <span 
                      className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center"
                      style={{
                        transform: 'translateZ(10px)',
                        boxShadow: '0 4px 12px hsl(var(--primary) / 0.5)',
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm max-w-xs mx-auto">
                    {step.description}
                  </p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>

          {/* Video Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 sm:mt-10 md:mt-12 max-w-3xl mx-auto"
          >
            <HowItWorksVideo />
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8"
          >
            <Button asChild size="lg" className="group w-full sm:w-auto min-h-[48px] touch-manipulation active:scale-95 transition-transform">
              <Link to="/request-invite">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="group w-full sm:w-auto min-h-[48px] touch-manipulation active:scale-95 transition-transform">
              <Link to="/how-it-works">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </HoloSection>
  );
}
