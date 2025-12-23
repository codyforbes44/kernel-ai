import { useState, useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { platformFeatures, platforms } from "@/lib/pricing-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface CategoryScore {
  category: string;
  kernel: number;
  lovable: number;
  bolt: number;
  v0: number;
  replit: number;
  cursor: number;
}

// Calculate feature value: true = 1, string (Limited/Pro) = 0.5, false = 0
const getFeatureScore = (value: boolean | string): number => {
  if (value === true) return 1;
  if (value === false) return 0;
  return 0.5; // "Limited", "Pro", etc.
};

// Calculate category scores for each platform
const calculateCategoryScores = (): CategoryScore[] => {
  const categories = ["Core", "AI Capabilities", "Deployment", "Collaboration", "Developer Experience"] as const;
  
  return categories.map((category) => {
    const categoryFeatures = platformFeatures.filter((f) => f.category === category);
    const totalFeatures = categoryFeatures.length;
    
    const scores: CategoryScore = {
      category,
      kernel: 0,
      lovable: 0,
      bolt: 0,
      v0: 0,
      replit: 0,
      cursor: 0,
    };
    
    if (totalFeatures === 0) return scores;
    
    categoryFeatures.forEach((feature) => {
      scores.kernel += getFeatureScore(feature.kernel);
      scores.lovable += getFeatureScore(feature.lovable);
      scores.bolt += getFeatureScore(feature.bolt);
      scores.v0 += getFeatureScore(feature.v0);
      scores.replit += getFeatureScore(feature.replit);
      scores.cursor += getFeatureScore(feature.cursor);
    });
    
    // Convert to percentage
    scores.kernel = Math.round((scores.kernel / totalFeatures) * 100);
    scores.lovable = Math.round((scores.lovable / totalFeatures) * 100);
    scores.bolt = Math.round((scores.bolt / totalFeatures) * 100);
    scores.v0 = Math.round((scores.v0 / totalFeatures) * 100);
    scores.replit = Math.round((scores.replit / totalFeatures) * 100);
    scores.cursor = Math.round((scores.cursor / totalFeatures) * 100);
    
    return scores;
  });
};

// Calculate overall score for a platform
const calculateOverallScore = (platformId: string, data: CategoryScore[]): number => {
  const total = data.reduce((sum, cat) => sum + (cat[platformId as keyof CategoryScore] as number), 0);
  return Math.round(total / data.length);
};

const platformColors: Record<string, string> = {
  kernel: "hsl(var(--primary))",
  lovable: "hsl(340, 82%, 59%)",
  bolt: "hsl(45, 93%, 47%)",
  v0: "hsl(0, 0%, 70%)",
  replit: "hsl(24, 94%, 53%)",
  cursor: "hsl(220, 70%, 55%)",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-popover/95 backdrop-blur border border-border rounded-lg p-3 shadow-xl">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {payload
          .sort((a, b) => b.value - a.value)
          .map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-medium text-foreground">{entry.value}%</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export const PlatformRadarChart = () => {
  const [visiblePlatforms, setVisiblePlatforms] = useState<Set<string>>(
    new Set(platforms.map((p) => p.id))
  );
  
  const data = useMemo(() => calculateCategoryScores(), []);
  
  const togglePlatform = (platformId: string) => {
    const newVisible = new Set(visiblePlatforms);
    if (newVisible.has(platformId)) {
      // Don't allow hiding all platforms
      if (newVisible.size > 1) {
        newVisible.delete(platformId);
      }
    } else {
      newVisible.add(platformId);
    }
    setVisiblePlatforms(newVisible);
  };
  
  const overallScores = useMemo(() => {
    return platforms.map((p) => ({
      ...p,
      score: calculateOverallScore(p.id, data),
    }));
  }, [data]);

  return (
    <div className="w-full">
      {/* Platform Toggles & Scores */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {overallScores.map((platform) => (
          <button
            key={platform.id}
            onClick={() => togglePlatform(platform.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200",
              visiblePlatforms.has(platform.id)
                ? platform.isHighlighted
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-muted/50 border-border text-foreground"
                : "bg-transparent border-border/30 text-muted-foreground opacity-50"
            )}
          >
            <Checkbox
              checked={visiblePlatforms.has(platform.id)}
              className="pointer-events-none"
            />
            <span className="font-medium">{platform.name}</span>
            <Badge
              variant={platform.isHighlighted ? "default" : "secondary"}
              className={cn(
                "text-xs",
                platform.isHighlighted && "bg-primary text-primary-foreground"
              )}
            >
              {platform.score}%
            </Badge>
          </button>
        ))}
      </div>

      {/* Radar Chart */}
      <div className="w-full h-[400px] md:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid
              gridType="polygon"
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
            />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickCount={5}
              axisLine={false}
            />
            
            {platforms.map((platform) => (
              visiblePlatforms.has(platform.id) && (
                <Radar
                  key={platform.id}
                  name={platform.name}
                  dataKey={platform.id}
                  stroke={platformColors[platform.id]}
                  fill={platformColors[platform.id]}
                  fillOpacity={platform.isHighlighted ? 0.4 : 0.15}
                  strokeWidth={platform.isHighlighted ? 3 : 1.5}
                  dot={platform.isHighlighted}
                />
              )
            ))}
            
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => (
                <span className="text-muted-foreground text-sm">{value}</span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Legend */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Hover over the chart to see exact percentages per category</p>
      </div>
    </div>
  );
};

export default PlatformRadarChart;
