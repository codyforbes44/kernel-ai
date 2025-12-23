import { Check, X } from "lucide-react";
import { forwardRef } from "react";

const keyFeatures = [
  { name: "AI Image Generation", kernel: true, lovable: false, bolt: false, v0: false, replit: true, cursor: false },
  { name: "Screenshot to UI", kernel: true, lovable: true, bolt: false, v0: true, replit: false, cursor: false },
  { name: "Real-time Cursors", kernel: true, lovable: true, bolt: true, v0: false, replit: true, cursor: false },
  { name: "Design System Builder", kernel: true, lovable: false, bolt: false, v0: false, replit: false, cursor: false },
  { name: "Component Marketplace", kernel: true, lovable: false, bolt: false, v0: false, replit: true, cursor: false },
  { name: "One-Click Deploy", kernel: true, lovable: true, bolt: true, v0: false, replit: true, cursor: false },
];

const platforms = ["Kernel", "Lovable", "Bolt", "v0", "Replit", "Cursor"];

const FeatureCheck = ({ value }: { value: boolean }) => {
  if (value) {
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center">
        <Check className="w-4 h-4 text-emerald-400" strokeWidth={3} />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
      <X className="w-4 h-4 text-red-400/70" strokeWidth={2} />
    </div>
  );
};

export const CompareOGImage = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      className="w-[1200px] h-[630px] bg-[#0a0a0f] relative overflow-hidden flex flex-col"
      style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#6366f1_0%,transparent_50%)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#8b5cf6_0%,transparent_50%)] opacity-15" />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header */}
      <div className="relative z-10 px-16 pt-12 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Kernel Logo */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.9"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <span className="text-3xl font-bold text-white tracking-tight">Kernel</span>
            <span className="text-indigo-400/80 text-lg font-medium ml-3">vs Competition</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-white/60 text-lg">kernel.cool/compare</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 px-16 py-4">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            The Complete AI Development Platform
          </h1>
          <p className="text-xl text-white/50">
            23 features. 6 platforms. Only one has everything.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-1 px-6 py-4 bg-white/[0.02] border-b border-white/10">
            <div className="text-white/50 text-sm font-medium">Feature</div>
            {platforms.map((platform, i) => (
              <div 
                key={platform} 
                className={`text-center text-sm font-semibold ${
                  i === 0 
                    ? "text-indigo-400" 
                    : "text-white/70"
                }`}
              >
                {platform}
              </div>
            ))}
          </div>

          {/* Feature Rows */}
          {keyFeatures.map((feature, index) => (
            <div 
              key={feature.name}
              className={`grid grid-cols-7 gap-1 px-6 py-3 ${
                index % 2 === 0 ? "bg-white/[0.01]" : ""
              } ${index === keyFeatures.length - 1 ? "" : "border-b border-white/5"}`}
            >
              <div className="text-white/80 text-sm font-medium flex items-center">
                {feature.name}
              </div>
              <div className="flex justify-center">
                <FeatureCheck value={feature.kernel} />
              </div>
              <div className="flex justify-center">
                <FeatureCheck value={feature.lovable} />
              </div>
              <div className="flex justify-center">
                <FeatureCheck value={feature.bolt} />
              </div>
              <div className="flex justify-center">
                <FeatureCheck value={feature.v0} />
              </div>
              <div className="flex justify-center">
                <FeatureCheck value={feature.replit} />
              </div>
              <div className="flex justify-center">
                <FeatureCheck value={feature.cursor} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-16 py-6 flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
              <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
            </div>
            <span className="text-white/50 text-sm">Supported</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="w-3 h-3 text-red-400/70" strokeWidth={2} />
            </div>
            <span className="text-white/50 text-sm">Not Available</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Kernel wins.
          </span>
          <span className="text-white/40">|</span>
          <span className="text-white/60 font-medium">Start building for free →</span>
        </div>
      </div>
    </div>
  );
});

CompareOGImage.displayName = "CompareOGImage";
