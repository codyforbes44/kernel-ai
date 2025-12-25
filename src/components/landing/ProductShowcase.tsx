import { motion } from "framer-motion";
import { Code2, Eye, Layers, Sparkles } from "lucide-react";
import { HoloCard, HoloCardContent } from "@/components/ui/holo-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlowText } from "@/components/ui/glow-text";
import { HoloSection } from "@/components/ui/holo-section";

const features = [
  {
    icon: Sparkles,
    title: "AI Chat Interface",
    description: "Natural language to code conversion",
  },
  {
    icon: Code2,
    title: "Live Code Editor",
    description: "Full Monaco editor with intellisense",
  },
  {
    icon: Eye,
    title: "Real-time Preview",
    description: "See changes instantly as you build",
  },
  {
    icon: Layers,
    title: "Component Library",
    description: "Pre-built components ready to use",
  },
];

export function ProductShowcase() {
  return (
    <HoloSection variant="default" className="py-20 px-4 overflow-hidden bg-muted/20">
      <div className="container mx-auto max-w-6xl preserve-3d">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <GlowText as="h2" variant="gradient" className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Development Environment
          </GlowText>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to build modern web applications in 2026
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Mock IDE Screenshot with 3D perspective */}
          <motion.div
            initial={{ opacity: 0, x: -30, rotateY: -10 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ 
              rotateY: 5, 
              rotateX: -2,
              scale: 1.02,
              transition: { duration: 0.3 } 
            }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <HoloCard variant="bordered" className="overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50 relative">
                {/* Scanline effect */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.03) 2px, hsl(var(--primary) / 0.03) 4px)',
                  }}
                />
                <div className="flex gap-1.5 relative z-10">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 relative z-10">
                  Kernel Builder — 2026
                </span>
              </div>
              
              {/* Mock Content */}
              <div className="grid grid-cols-3 min-h-[300px] relative">
                {/* Scanline overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-20 z-10"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.02) 2px, hsl(var(--primary) / 0.02) 4px)',
                  }}
                />
                
                {/* File Explorer */}
                <div className="border-r border-border/50 p-3 bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">FILES</p>
                  <div className="space-y-1">
                    {["src/", "├ components/", "├ pages/", "└ App.tsx"].map((file) => (
                      <p key={file} className="text-xs text-muted-foreground font-mono">{file}</p>
                    ))}
                  </div>
                </div>
                
                {/* Code Editor */}
                <div className="p-3 font-mono text-xs col-span-2">
                  <div className="space-y-1">
                    <p><span className="text-purple-400">import</span> <span className="text-green-400">React</span> <span className="text-purple-400">from</span> <span className="text-amber-400">'react'</span>;</p>
                    <p className="text-muted-foreground/50">// AI-generated component</p>
                    <p><span className="text-purple-400">export function</span> <span className="text-blue-400">Hero</span>() {"{"}</p>
                    <p className="pl-4"><span className="text-purple-400">return</span> (</p>
                    <p className="pl-8"><span className="text-green-400">&lt;div&gt;</span></p>
                    <p className="pl-12 text-amber-400">"Build 2026"</p>
                    <p className="pl-8"><span className="text-green-400">&lt;/div&gt;</span></p>
                    <p className="pl-4">);</p>
                    <p>{"}"}</p>
                  </div>
                </div>
              </div>
            </HoloCard>
          </motion.div>

          {/* Feature Cards with staggered depth */}
          <div className="grid sm:grid-cols-2 gap-4 preserve-3d">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20, z: -50 }}
                whileInView={{ opacity: 1, y: 0, z: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ 
                  y: -8,
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
                className={`float-3d-${(index % 4) + 1}`}
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: `translateZ(${index * 10}px)`,
                }}
              >
                <GlassPanel variant="glow" className="p-4 h-full">
                  <div className="flex items-start gap-3">
                    <div 
                      className="p-2 rounded-lg bg-primary/10 border border-primary/20"
                      style={{
                        boxShadow: '0 0 15px hsl(var(--primary) / 0.2)',
                      }}
                    >
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </HoloSection>
  );
}
