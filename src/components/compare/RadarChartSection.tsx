import { PlatformRadarChart } from "@/components/pricing/PlatformRadarChart";

export const RadarChartSection = () => {
  return (
    <section className="py-16 border-t border-border/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Feature Coverage at a Glance
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how platforms compare across 5 key categories. Kernel achieves 100% coverage 
            in every category—the only platform to do so.
          </p>
        </div>
        <PlatformRadarChart />
      </div>
    </section>
  );
};
