import { motion } from "framer-motion";

const techLogos = [
  { name: "React", icon: "⚛️" },
  { name: "TypeScript", icon: "📘" },
  { name: "Tailwind", icon: "🎨" },
  { name: "Vite", icon: "⚡" },
  { name: "Supabase", icon: "🔥" },
];

export function SocialProofSection() {
  return (
    <section className="py-16 px-4 border-b border-border/40">
      <div className="container mx-auto max-w-5xl">

        {/* Tech Logos */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <p className="text-sm text-muted-foreground">Built with:</p>
          {techLogos.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-xl">{tech.icon}</span>
              <span className="text-sm font-medium">{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
