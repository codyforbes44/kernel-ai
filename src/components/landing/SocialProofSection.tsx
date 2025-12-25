import { motion } from "framer-motion";
import { HoloSection } from "@/components/ui/holo-section";
import { GlowText } from "@/components/ui/glow-text";

const techLogos = [
  { name: "React", icon: "⚛️" },
  { name: "TypeScript", icon: "📘" },
  { name: "Tailwind", icon: "🎨" },
  { name: "Vite", icon: "⚡" },
  { name: "Supabase", icon: "🔥" },
];

export function SocialProofSection() {
  return (
    <HoloSection variant="default" className="py-16 px-4 border-b border-border/40">
      <div className="container mx-auto max-w-5xl preserve-3d">
        {/* Tech Logos with depth staggering */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <p className="text-sm text-muted-foreground">
            Built with:
          </GlowText>
          {techLogos.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.08, duration: 0.5 }}
              whileHover={{ 
                y: -5, 
                scale: 1.1,
                transition: { duration: 0.2 } 
              }}
              className={`flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-default float-3d float-3d-${(index % 4) + 1} group`}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <span 
                className="text-xl group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)] transition-all"
              >
                {tech.icon}
              </span>
              <span className="text-sm font-medium group-hover:text-primary transition-colors">
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </HoloSection>
  );
}
