import { Users, Star, Code2 } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { icon: Users, value: "10,000+", label: "Developers" },
  { icon: Code2, value: "50,000+", label: "Projects Built" },
  { icon: Star, value: "4.9/5", label: "Average Rating" },
];

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
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

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
