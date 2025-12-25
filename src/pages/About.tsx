import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SEO } from "@/components/seo/SEO";
import { SEO_CONFIG, PAGE_SEO, getOrganizationSchema, BREADCRUMBS } from "@/lib/seo";
import { values, milestones } from "@/lib/about-data";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

const MotionCard = motion(Card);

export default function About() {
  return (
    <PublicLayout backgroundIntensity="medium">
      <SEO 
        title={PAGE_SEO.about.title}
        description={PAGE_SEO.about.description}
        ogImage={PAGE_SEO.about.ogImage}
        keywords={PAGE_SEO.about.keywords as unknown as string[]}
        canonical="/about"
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          BREADCRUMBS.about(SEO_CONFIG.siteUrl),
        ]}
      />

      {/* Hero - Mission Statement */}
      <motion.section 
        className="pt-12 sm:pt-16 pb-8 sm:pb-12 px-4"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="mb-4 bg-primary/10 border-primary/30">
              Our Mission
            </Badge>
          </motion.div>
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6"
            variants={fadeInUp}
          >
            Empowering developers to{" "}
            <span className="text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]">build faster</span>
          </motion.h1>
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            We're on a mission to democratize software development. By combining 
            cutting-edge AI with intuitive design, we're making it possible for 
            anyone to bring their ideas to life in 2026 and beyond.
          </motion.p>
        </div>
      </motion.section>

      {/* Story Section */}
      <motion.section 
        className="pb-20 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="container mx-auto max-w-5xl">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <Badge variant="secondary" className="mb-4">
              Our Story
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From idea to reality
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every great company starts with a simple observation. Ours was that 
              developers spend too much time on repetitive tasks instead of creating.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {milestones.map((milestone, index) => (
              <MotionCard 
                key={milestone.year} 
                className="relative overflow-hidden group"
                variants={cardVariant}
                whileHover={{ 
                  y: -5, 
                  transition: { duration: 0.2 } 
                }}
              >
                <motion.div 
                  className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/20"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ originY: 0 }}
                />
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div 
                      className="p-2 rounded-lg bg-primary/10"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <milestone.icon className="h-5 w-5 text-primary" />
                    </motion.div>
                    <Badge variant="outline">{milestone.year}</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {milestone.description}
                  </p>
                </CardContent>
              </MotionCard>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section 
        className="pb-20 px-4 bg-muted/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="container mx-auto max-w-5xl py-16">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <Badge variant="secondary" className="mb-4">
              Our Values
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What drives us forward
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide every decision we make and every feature we build.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {values.map((value) => (
              <MotionCard 
                key={value.title} 
                className="group hover:border-primary/50 transition-colors"
                variants={cardVariant}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 } 
                }}
              >
                <CardContent className="p-6 flex gap-4">
                  <motion.div 
                    className="p-3 rounded-xl bg-primary/10 h-fit shrink-0 group-hover:bg-primary/20 transition-colors"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <value.icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {value.description}
                    </p>
                  </div>
                </CardContent>
              </MotionCard>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="pb-20 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-border p-8 md:p-12 text-center"
            whileHover={{ 
              boxShadow: "0 20px 40px -20px hsl(var(--primary) / 0.3)",
              transition: { duration: 0.3 }
            }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Join us on our journey
            </motion.h2>
            <motion.p 
              className="text-muted-foreground mb-8 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Whether you're building your first app or your hundredth, we're here 
              to help you succeed. Start building with Kernel today.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="gold" size="lg" asChild>
                <Link to="/auth">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="gold-outline" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </PublicLayout>
  );
}
