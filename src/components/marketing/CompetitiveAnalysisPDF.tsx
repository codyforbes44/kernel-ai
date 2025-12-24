import { forwardRef } from "react";
import { Check, X } from "lucide-react";
import { platformFeatures, platforms } from "@/lib/pricing-data";

const FeatureIcon = ({ value }: { value: boolean | string }) => {
  if (value === true) {
    return (
      <div style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Check style={{ width: 12, height: 12, color: "#10b981" }} />
      </div>
    );
  }
  if (value === false) {
    return (
      <div style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <X style={{ width: 12, height: 12, color: "#ef4444" }} />
      </div>
    );
  }
  return (
    <span style={{
      fontSize: 9,
      fontWeight: 500,
      color: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.2)",
      padding: "2px 6px",
      borderRadius: 4,
    }}>
      {value}
    </span>
  );
};

// Calculate platform scores
const calculatePlatformScore = (platformKey: keyof typeof platformFeatures[0]) => {
  let score = 0;
  platformFeatures.forEach((feature) => {
    const value = feature[platformKey];
    if (value === true) score += 1;
    else if (typeof value === "string") score += 0.5;
  });
  return Math.round((score / platformFeatures.length) * 100);
};

const platformScores = {
  kernel: calculatePlatformScore("kernel"),
  lovable: calculatePlatformScore("lovable"),
  bolt: calculatePlatformScore("bolt"),
  v0: calculatePlatformScore("v0"),
  replit: calculatePlatformScore("replit"),
  cursor: calculatePlatformScore("cursor"),
};

// Group features by category
const groupedFeatures = platformFeatures.reduce((acc, feature) => {
  if (!acc[feature.category]) {
    acc[feature.category] = [];
  }
  acc[feature.category].push(feature);
  return acc;
}, {} as Record<string, typeof platformFeatures>);

// Exclusive features (only Kernel has them)
const exclusiveFeatures = platformFeatures.filter(
  (f) => f.kernel === true && !f.lovable && !f.bolt && !f.v0 && !f.replit && !f.cursor
);

export const CompetitiveAnalysisPDF = forwardRef<HTMLDivElement>((_, ref) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      ref={ref}
      style={{
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        backgroundColor: "#0a0a0f",
        color: "#ffffff",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: 32,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            background: "linear-gradient(135deg, #a855f7, #6366f1)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 20,
          }}>
            K
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>Kernel</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
              Competitive Analysis Report
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{currentDate}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>CONFIDENTIAL</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 20,
      }}>
        {[
          { label: "Total Features", value: "23", color: "#a855f7" },
          { label: "Kernel Coverage", value: "100%", color: "#10b981" },
          { label: "Categories", value: "5", color: "#6366f1" },
          { label: "Exclusives", value: exclusiveFeatures.length.toString(), color: "#f59e0b" },
        ].map((metric) => (
          <div key={metric.label} style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: 12,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: metric.color }}>
              {metric.value}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Platform Scores Bar Chart */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: "rgba(255,255,255,0.9)" }}>
          Overall Platform Scores
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {platforms.map((platform) => {
            const score = platformScores[platform.id as keyof typeof platformScores];
            const isKernel = platform.id === "kernel";
            return (
              <div key={platform.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 60, fontSize: 10, fontWeight: isKernel ? 600 : 400, color: isKernel ? "#a855f7" : "rgba(255,255,255,0.7)" }}>
                  {platform.name}
                </div>
                <div style={{ flex: 1, height: 14, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    width: `${score}%`,
                    height: "100%",
                    background: isKernel
                      ? "linear-gradient(90deg, #a855f7, #6366f1)"
                      : "rgba(255,255,255,0.2)",
                    borderRadius: 4,
                    transition: "width 0.3s",
                  }} />
                </div>
                <div style={{ width: 35, fontSize: 10, fontWeight: 600, textAlign: "right", color: isKernel ? "#a855f7" : "rgba(255,255,255,0.7)" }}>
                  {score}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div style={{
        flex: 1,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        overflow: "hidden",
      }}>
        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "140px repeat(6, 1fr)",
          backgroundColor: "rgba(255,255,255,0.05)",
          padding: "8px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Feature</div>
          {platforms.map((p) => (
            <div key={p.id} style={{
              fontSize: 9,
              fontWeight: p.id === "kernel" ? 700 : 500,
              color: p.id === "kernel" ? "#a855f7" : "rgba(255,255,255,0.8)",
              textAlign: "center",
            }}>
              {p.name}
            </div>
          ))}
        </div>

        {/* Table Body */}
        <div style={{ fontSize: 9, maxHeight: 480, overflow: "hidden" }}>
          {Object.entries(groupedFeatures).map(([category, features]) => (
            <div key={category}>
              {/* Category Header */}
              <div style={{
                backgroundColor: "rgba(168, 85, 247, 0.1)",
                padding: "4px 12px",
                fontSize: 9,
                fontWeight: 600,
                color: "#a855f7",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                {category}
              </div>
              {/* Features */}
              {features.map((feature, idx) => (
                <div
                  key={feature.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px repeat(6, 1fr)",
                    padding: "6px 12px",
                    backgroundColor: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)" }}>
                    {feature.name}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <FeatureIcon value={feature.kernel} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <FeatureIcon value={feature.lovable} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <FeatureIcon value={feature.bolt} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <FeatureIcon value={feature.v0} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <FeatureIcon value={feature.replit} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <FeatureIcon value={feature.cursor} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Exclusive Features */}
      <div style={{
        marginTop: 16,
        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(99, 102, 241, 0.1))",
        border: "1px solid rgba(168, 85, 247, 0.3)",
        borderRadius: 8,
        padding: 12,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#a855f7", marginBottom: 8 }}>
          🚀 Exclusive to Kernel
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {exclusiveFeatures.map((feature) => (
            <div key={feature.name} style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10,
              color: "rgba(255,255,255,0.9)",
            }}>
              <Check style={{ width: 12, height: 12, color: "#10b981" }} />
              {feature.name}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 16,
        paddingTop: 12,
        borderTop: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 9,
        color: "rgba(255,255,255,0.4)",
      }}>
        <div>kernel.dev • The Complete AI Development Platform</div>
        <div style={{ display: "flex", gap: 16 }}>
          <span>✓ Fully Supported</span>
          <span>✗ Not Available</span>
          <span style={{ color: "#f59e0b" }}>Limited</span>
        </div>
      </div>
    </div>
  );
});

CompetitiveAnalysisPDF.displayName = "CompetitiveAnalysisPDF";
