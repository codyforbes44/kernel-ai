import { motion } from "framer-motion";
import { MessageSquare, Wand2, Rocket } from "lucide-react";

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
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background perspective-container">
      <div className="container mx-auto max-w-5xl preserve-3d">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From idea to deployed app in three simple steps
          </p>
        </motion.div>

        <div className="relative preserve-3d">
          {/* 3D Connection Line */}
          <div 
            className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2"
            style={{ 
              transform: 'translateZ(-20px) translateY(-50%)',
            }}
          />

          <div className="grid md:grid-cols-3 gap-8 md:gap-4">
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
                className="relative text-center depth-card"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: `translateZ(${(2 - index) * -15}px)`,
                }}
              >
                {/* Step number badge with depth glow */}
                <div className="relative inline-block mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto border border-primary/20"
                    style={{
                      boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.3)',
                    }}
                  >
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span 
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center"
                    style={{
                      transform: 'translateZ(10px)',
                      boxShadow: '0 4px 12px hsl(var(--primary) / 0.4)',
                    }}
                  >
                    {index + 1}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
