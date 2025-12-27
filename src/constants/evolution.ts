// Evolution tiers based on affinity levels
export interface EvolutionTier {
  id: string;
  name: string;
  title: string;
  minAffinity: number;
  maxAffinity: number;
  glowColor: string;
  borderColor: string;
  badgeColor: string;
  particleEffect?: 'none' | 'sparkle' | 'glow' | 'aura' | 'cosmic';
  avatarFrame?: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'cosmic';
  description: string;
}

export const EVOLUTION_TIERS: EvolutionTier[] = [
  {
    id: 'newcomer',
    name: 'Newcomer',
    title: 'New Acquaintance',
    minAffinity: 0,
    maxAffinity: 15,
    glowColor: 'transparent',
    borderColor: 'border-muted',
    badgeColor: 'bg-muted text-muted-foreground',
    particleEffect: 'none',
    avatarFrame: 'none',
    description: 'Just getting to know each other',
  },
  {
    id: 'familiar',
    name: 'Familiar',
    title: 'Friendly Face',
    minAffinity: 16,
    maxAffinity: 35,
    glowColor: 'rgba(205, 127, 50, 0.3)',
    borderColor: 'border-amber-600/50',
    badgeColor: 'bg-amber-600/20 text-amber-600',
    particleEffect: 'sparkle',
    avatarFrame: 'bronze',
    description: 'Building a foundation of trust',
  },
  {
    id: 'companion',
    name: 'Companion',
    title: 'Trusted Companion',
    minAffinity: 36,
    maxAffinity: 55,
    glowColor: 'rgba(192, 192, 192, 0.4)',
    borderColor: 'border-slate-400',
    badgeColor: 'bg-slate-400/20 text-slate-500',
    particleEffect: 'glow',
    avatarFrame: 'silver',
    description: 'A reliable presence in your life',
  },
  {
    id: 'confidant',
    name: 'Confidant',
    title: 'Dear Confidant',
    minAffinity: 56,
    maxAffinity: 75,
    glowColor: 'rgba(255, 215, 0, 0.4)',
    borderColor: 'border-yellow-500',
    badgeColor: 'bg-yellow-500/20 text-yellow-600',
    particleEffect: 'aura',
    avatarFrame: 'gold',
    description: 'Someone you can truly rely on',
  },
  {
    id: 'soulmate',
    name: 'Soulmate',
    title: 'Kindred Spirit',
    minAffinity: 76,
    maxAffinity: 90,
    glowColor: 'rgba(229, 228, 226, 0.5)',
    borderColor: 'border-slate-300',
    badgeColor: 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800',
    particleEffect: 'aura',
    avatarFrame: 'platinum',
    description: 'A deep, meaningful connection',
  },
  {
    id: 'eternal',
    name: 'Eternal',
    title: 'Eternal Bond',
    minAffinity: 91,
    maxAffinity: 100,
    glowColor: 'rgba(185, 242, 255, 0.6)',
    borderColor: 'border-cyan-300',
    badgeColor: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white',
    particleEffect: 'cosmic',
    avatarFrame: 'diamond',
    description: 'An unbreakable, transcendent bond',
  },
];

export const AVATAR_FRAMES = {
  none: '',
  bronze: 'ring-2 ring-amber-600/60 ring-offset-2 ring-offset-background',
  silver: 'ring-2 ring-slate-400 ring-offset-2 ring-offset-background shadow-lg shadow-slate-400/30',
  gold: 'ring-3 ring-yellow-500 ring-offset-2 ring-offset-background shadow-lg shadow-yellow-500/40',
  platinum: 'ring-3 ring-slate-300 ring-offset-2 ring-offset-background shadow-xl shadow-slate-300/50',
  diamond: 'ring-4 ring-cyan-300 ring-offset-2 ring-offset-background shadow-xl shadow-cyan-300/60',
  cosmic: 'ring-4 ring-purple-400 ring-offset-2 ring-offset-background shadow-2xl shadow-purple-500/70',
};

export function getEvolutionTier(affinity: number): EvolutionTier {
  return EVOLUTION_TIERS.find(
    tier => affinity >= tier.minAffinity && affinity <= tier.maxAffinity
  ) || EVOLUTION_TIERS[0];
}

export function getNextEvolutionTier(affinity: number): EvolutionTier | null {
  const currentTier = getEvolutionTier(affinity);
  const currentIndex = EVOLUTION_TIERS.findIndex(t => t.id === currentTier.id);
  return currentIndex < EVOLUTION_TIERS.length - 1 ? EVOLUTION_TIERS[currentIndex + 1] : null;
}

export function getEvolutionProgress(affinity: number): number {
  const tier = getEvolutionTier(affinity);
  const nextTier = getNextEvolutionTier(affinity);
  
  if (!nextTier) return 100;
  
  const tierRange = tier.maxAffinity - tier.minAffinity;
  const progress = affinity - tier.minAffinity;
  
  return Math.min(100, Math.round((progress / tierRange) * 100));
}
