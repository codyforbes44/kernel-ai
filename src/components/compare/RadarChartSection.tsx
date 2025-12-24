import { PlatformRadarChart } from "@/components/pricing/PlatformRadarChart";

export const RadarChartSection = () => {
  return (
    <section className="py-12 md:py-16 border-t border-border/50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
            Feature Coverage at a Glance
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4 md:px-0">
            See how platforms compare across 5 key categories. Kernel achieves 100% coverage 
            in every category—the only platform to do so.
          </p>
        </div>
        <PlatformRadarChart />
      </div>
    </section>
  );
};
