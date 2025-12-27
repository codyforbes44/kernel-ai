import { motion } from 'framer-motion';
import { Bot, Wand2, Database, Rocket, Code } from 'lucide-react';

/**
 * HomepageOGImageV3 - Optimized OG image component for social sharing
 * Dimensions: 1200x630 for optimal social media display
 * Use html-to-image or similar to capture as static image
 */
export function HomepageOGImageV3() {
  return (
    <div 
      className="relative w-[1200px] h-[630px] bg-gradient-to-br from-background via-background to-primary/10 overflow-hidden"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Gradient Orbs */}
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-150px] left-[-100px] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px]" />
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full p-16">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/20">
            <Code className="w-9 h-9 text-primary-foreground" />
          </div>
          <span className="text-4xl font-bold tracking-tight text-foreground">Kernel</span>
        </div>
        
        {/* Hero Text */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            AI Development OS
          </h1>
          <p className="text-3xl text-muted-foreground max-w-[700px] leading-relaxed">
            Build production-ready apps in minutes with intelligent AI, visual builder, and instant deployment.
          </p>
        </div>
        
        {/* Feature Pills */}
        <div className="flex items-center gap-6 mt-auto">
          <FeaturePill icon={Bot} label="AI Chat" />
          <FeaturePill icon={Wand2} label="Visual Builder" />
          <FeaturePill icon={Database} label="Database" />
          <FeaturePill icon={Rocket} label="Deploy" />
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-1/2 right-16 -translate-y-1/2">
        <div className="relative">
          {/* Floating Cards */}
          <FloatingCard 
            className="absolute -top-20 -left-10 rotate-[-8deg]"
            delay={0}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">AI Ready</div>
                <div className="text-xs text-muted-foreground">Built-in intelligence</div>
              </div>
            </div>
          </FloatingCard>
          
          <FloatingCard 
            className="absolute top-10 left-20 rotate-[6deg]"
            delay={0.2}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Deploy Instantly</div>
                <div className="text-xs text-muted-foreground">One-click publish</div>
              </div>
            </div>
          </FloatingCard>
          
          <FloatingCard 
            className="absolute top-40 -left-5 rotate-[-4deg]"
            delay={0.4}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Full Backend</div>
                <div className="text-xs text-muted-foreground">Database included</div>
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>
      
      {/* URL Badge */}
      <div className="absolute bottom-8 right-16 px-6 py-3 bg-muted/80 backdrop-blur-sm rounded-full border border-border/50">
        <span className="text-lg font-medium text-foreground">kernel.cool</span>
      </div>
    </div>
  );
}

function FeaturePill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-muted/50 backdrop-blur-sm rounded-full border border-border/50">
      <Icon className="w-5 h-5 text-primary" />
      <span className="text-lg font-medium text-foreground">{label}</span>
    </div>
  );
}

function FloatingCard({ 
  children, 
  className,
  delay = 0,
}: { 
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`p-4 bg-card/90 backdrop-blur-sm rounded-xl border border-border/50 shadow-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

export default HomepageOGImageV3;
