// Kernel-themed star colors - using brand primary/accent colors
export const STAR_COLORS: Record<string, string> = {
  'white': 'hsl(200, 20%, 95%)',
  'primary': 'hsl(var(--primary))',
  'accent': 'hsl(185, 80%, 65%)',
  'gold': 'hsl(45, 100%, 70%)',
  'innovation': 'hsl(280, 70%, 70%)',
  'energy': 'hsl(15, 90%, 65%)',
};

export type StarColor = keyof typeof STAR_COLORS;
export type ConstellationDetail = 'full' | 'simplified' | 'minimal';

export interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleDelay: number;
}

export interface ConstellationStar extends Star {
  id: string;
  name?: string;
  label?: string;
  color: StarColor;
  points: 4 | 6 | 8;
  hasSpark?: boolean;
}

export interface ConstellationLine {
  from: string;
  to: string;
}

export interface Nebula {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  color: string;
}

export interface ConstellationData {
  name: string;
  displayName: string;
  kernelTheme: string;
  stars: ConstellationStar[];
  lines: ConstellationLine[];
  nebulae?: Nebula[];
}
