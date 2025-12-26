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
    <HoloSection variant="default" className="py-8 sm:py-10 md:py-14 lg:py-16 px-4 border-b border-border/40 scroll-mt-20">
      <div className="container mx-auto max-w-5xl preserve-3d">
        {/* Tech Logos with depth staggering */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-10">
          <span className="text-xs sm:text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left mb-2 sm:mb-0">
            Built with:
          </span>
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
              className={`flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-default float-3d float-3d-${(index % 4) + 1} group touch-manipulation`}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <span 
                className="text-lg sm:text-xl group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)] transition-all"
              >
                {tech.icon}
              </span>
              <span className="text-xs sm:text-sm font-medium group-hover:text-primary transition-colors">
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </HoloSection>
  );
}
