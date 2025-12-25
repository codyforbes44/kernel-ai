import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Star, TrendingUp, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote: "The Design System Builder alone saved us 40 hours on our last project.",
    author: "Sarah K.",
    role: "Lead Developer",
    switchedFrom: "Lovable",
  },
  {
    quote: "Finally, a platform where I don't need 5 different tools to ship.",
    author: "Marcus T.",
    role: "Indie Hacker",
    switchedFrom: "Bolt",
  },
  {
    quote: "Component Marketplace is a game changer. One click and it just works.",
    author: "Elena R.",
    role: "Startup Founder",
    switchedFrom: "v0",
  },
  {
    quote: "Switched from Cursor because I needed the full picture, not just code.",
    author: "James L.",
    role: "Full Stack Dev",
    switchedFrom: "Cursor",
  },
];

const stats = [
  { label: "Developers this week", value: "2,847", icon: Users },
  { label: "Average rating", value: "4.9/5", icon: Star },
  { label: "Productivity boost", value: "+73%", icon: TrendingUp },
];

export const SocialProofBanner = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-y border-border/50 bg-muted/20">
      <div className="container px-4 md:px-6 py-6 md:py-8">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Stats */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm md:text-base font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Rotating Testimonials */}
          <div className="relative h-20 md:h-24 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-primary/50 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm md:text-base text-foreground italic mb-2 line-clamp-2">
                      "{testimonials[currentTestimonial].quote}"
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {testimonials[currentTestimonial].author}
                      </span>
                      <span>•</span>
                      <span>{testimonials[currentTestimonial].role}</span>
                      <span>•</span>
                      <span className="text-amber-400">
                        Switched from {testimonials[currentTestimonial].switchedFrom}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots indicator */}
            <div className="absolute bottom-0 left-8 flex gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    i === currentTestimonial ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
