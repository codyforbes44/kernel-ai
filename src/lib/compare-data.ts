export const COMPARE_SHARE_TEXT = `🏆 Kernel: 100% Feature Coverage vs 27-73% for competitors

❌ Lovable: Missing AI Image Gen, Design System, Marketplace
❌ Bolt: Missing AI Image Gen, Design System, Marketplace  
❌ v0: Missing 4 core features, limited Agent Mode
❌ Cursor: Missing 5 features — only Agent Mode

✅ Kernel has it ALL:
• AI Image Generation + Screenshot to UI
• Design System Builder (EXCLUSIVE)
• Component Marketplace (EXCLUSIVE)
• Real-time Collaboration + One-Click Deploy

Stop settling for incomplete tools.

See the full breakdown 👇`;

export const COMPARE_SOCIAL_FEATURES = [
  { name: "AI Image Generation", kernel: true, lovable: false, bolt: false, v0: false, replit: true, cursor: false },
  { name: "Screenshot to UI", kernel: true, lovable: true, bolt: true, v0: true, replit: false, cursor: false },
  { name: "Agent Mode", kernel: true, lovable: true, bolt: true, v0: "Limited", replit: true, cursor: true },
  { name: "Real-time Cursors", kernel: true, lovable: true, bolt: true, v0: false, replit: true, cursor: false },
  { name: "Design System Builder", kernel: true, lovable: false, bolt: false, v0: false, replit: false, cursor: false },
  { name: "Component Marketplace", kernel: true, lovable: false, bolt: false, v0: false, replit: true, cursor: false },
] as const;

// Calculate feature coverage percentages
export const COMPETITOR_COVERAGE = {
  kernel: { score: 100, missing: 0 },
  lovable: { score: 67, missing: 2, gaps: ["AI Image Generation", "Design System Builder", "Component Marketplace"] },
  bolt: { score: 67, missing: 2, gaps: ["AI Image Generation", "Design System Builder", "Component Marketplace"] },
  v0: { score: 33, missing: 4, gaps: ["AI Image Generation", "Real-time Cursors", "Design System Builder", "Component Marketplace"] },
  replit: { score: 67, missing: 2, gaps: ["Screenshot to UI", "Design System Builder"] },
  cursor: { score: 17, missing: 5, gaps: ["AI Image Generation", "Screenshot to UI", "Real-time Cursors", "Design System Builder", "Component Marketplace"] },
} as const;

export const EXCLUSIVE_FEATURES = ["Design System Builder", "Component Marketplace"] as const;
