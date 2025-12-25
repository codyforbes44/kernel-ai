import type { ConstellationData } from './types';

// Kernel-branded constellation patterns representing core capabilities
export const CONSTELLATIONS: ConstellationData[] = [
  {
    name: 'creation',
    displayName: 'Creation',
    kernelTheme: 'Build & Create',
    stars: [
      { id: 'idea', x: 40, y: 50, size: 2.5, brightness: 0.9, twinkleSpeed: 4, twinkleDelay: 0, color: 'accent', points: 6, label: 'Idea' },
      { id: 'design', x: 50, y: 52, size: 3.5, brightness: 1, twinkleSpeed: 3.5, twinkleDelay: 0.5, name: 'Design', color: 'primary', points: 8, hasSpark: true, label: 'Design' },
      { id: 'prototype', x: 60, y: 50, size: 2.5, brightness: 0.85, twinkleSpeed: 4.5, twinkleDelay: 1, color: 'accent', points: 6, label: 'Prototype' },
      { id: 'innovate', x: 25, y: 25, size: 4, brightness: 1, twinkleSpeed: 3, twinkleDelay: 0.3, name: 'Innovate', color: 'innovation', points: 8, hasSpark: true, label: 'Innovate' },
      { id: 'iterate', x: 75, y: 28, size: 3, brightness: 0.9, twinkleSpeed: 3.2, twinkleDelay: 0.7, name: 'Iterate', color: 'accent', points: 6, label: 'Iterate' },
      { id: 'launch', x: 70, y: 85, size: 4, brightness: 1, twinkleSpeed: 2.8, twinkleDelay: 0.2, name: 'Launch', color: 'primary', points: 8, hasSpark: true, label: 'Launch' },
      { id: 'scale', x: 30, y: 82, size: 3, brightness: 0.8, twinkleSpeed: 4, twinkleDelay: 0.9, color: 'accent', points: 6, label: 'Scale' },
      { id: 'spark1', x: 48, y: 60, size: 1.5, brightness: 0.5, twinkleSpeed: 5, twinkleDelay: 1.2, color: 'white', points: 4 },
      { id: 'spark2', x: 50, y: 65, size: 2, brightness: 0.6, twinkleSpeed: 4.5, twinkleDelay: 0.8, color: 'gold', points: 4 },
      { id: 'spark3', x: 52, y: 70, size: 1.5, brightness: 0.5, twinkleSpeed: 5, twinkleDelay: 1.5, color: 'white', points: 4 },
    ],
    lines: [
      { from: 'idea', to: 'design' },
      { from: 'design', to: 'prototype' },
      { from: 'innovate', to: 'idea' },
      { from: 'iterate', to: 'prototype' },
      { from: 'idea', to: 'scale' },
      { from: 'prototype', to: 'launch' },
      { from: 'design', to: 'spark1' },
      { from: 'spark1', to: 'spark2' },
      { from: 'spark2', to: 'spark3' },
    ],
    nebulae: [
      { x: 48, y: 64, width: 24, height: 28, rotation: -15, opacity: 0.08, color: 'hsl(var(--primary))' },
    ],
  },
  {
    name: 'development',
    displayName: 'Development',
    kernelTheme: 'Code & Deploy',
    stars: [
      { id: 'code', x: 10, y: 20, size: 3, brightness: 0.95, twinkleSpeed: 3.5, twinkleDelay: 0, name: 'Code', color: 'primary', points: 8, hasSpark: true, label: 'Code' },
      { id: 'test', x: 10, y: 45, size: 2.8, brightness: 0.85, twinkleSpeed: 4, twinkleDelay: 0.4, name: 'Test', color: 'accent', points: 6, label: 'Test' },
      { id: 'build', x: 30, y: 55, size: 2.5, brightness: 0.8, twinkleSpeed: 4.2, twinkleDelay: 0.8, color: 'white', points: 6, label: 'Build' },
      { id: 'review', x: 45, y: 45, size: 2.2, brightness: 0.7, twinkleSpeed: 4.5, twinkleDelay: 0.2, color: 'white', points: 4, label: 'Review' },
      { id: 'merge', x: 60, y: 40, size: 2.8, brightness: 0.9, twinkleSpeed: 3.8, twinkleDelay: 0.6, name: 'Merge', color: 'accent', points: 6, label: 'Merge' },
      { id: 'deploy', x: 75, y: 35, size: 3.2, brightness: 0.95, twinkleSpeed: 3.5, twinkleDelay: 1, name: 'Deploy', color: 'primary', points: 8, hasSpark: true, label: 'Deploy' },
      { id: 'monitor', x: 77, y: 33, size: 1.5, brightness: 0.5, twinkleSpeed: 5, twinkleDelay: 1.2, color: 'gold', points: 4 },
      { id: 'ship', x: 90, y: 25, size: 3.5, brightness: 1, twinkleSpeed: 3.2, twinkleDelay: 0.3, name: 'Ship', color: 'energy', points: 8, hasSpark: true, label: 'Ship' },
    ],
    lines: [
      { from: 'code', to: 'test' },
      { from: 'test', to: 'build' },
      { from: 'build', to: 'review' },
      { from: 'review', to: 'code' },
      { from: 'review', to: 'merge' },
      { from: 'merge', to: 'deploy' },
      { from: 'deploy', to: 'ship' },
    ],
    nebulae: [
      { x: 55, y: 38, width: 30, height: 20, rotation: 10, opacity: 0.06, color: 'hsl(185, 80%, 65%)' },
    ],
  },
  {
    name: 'intelligence',
    displayName: 'Intelligence',
    kernelTheme: 'AI & Automation',
    stars: [
      { id: 'learn', x: 10, y: 40, size: 3, brightness: 0.95, twinkleSpeed: 3.3, twinkleDelay: 0, name: 'Learn', color: 'innovation', points: 8, hasSpark: true, label: 'Learn' },
      { id: 'analyze', x: 25, y: 20, size: 2.8, brightness: 0.85, twinkleSpeed: 4, twinkleDelay: 0.5, name: 'Analyze', color: 'accent', points: 6, label: 'Analyze' },
      { id: 'predict', x: 50, y: 50, size: 3.5, brightness: 1, twinkleSpeed: 3.5, twinkleDelay: 0.2, name: 'Predict', color: 'primary', points: 8, hasSpark: true, label: 'Predict' },
      { id: 'automate', x: 75, y: 25, size: 2.8, brightness: 0.9, twinkleSpeed: 4.2, twinkleDelay: 0.7, name: 'Automate', color: 'accent', points: 6, label: 'Automate' },
      { id: 'optimize', x: 90, y: 45, size: 3, brightness: 0.95, twinkleSpeed: 3.8, twinkleDelay: 0.4, name: 'Optimize', color: 'gold', points: 8, hasSpark: true, label: 'Optimize' },
    ],
    lines: [
      { from: 'learn', to: 'analyze' },
      { from: 'analyze', to: 'predict' },
      { from: 'predict', to: 'automate' },
      { from: 'automate', to: 'optimize' },
    ],
    nebulae: [
      { x: 50, y: 35, width: 40, height: 25, rotation: -5, opacity: 0.07, color: 'hsl(280, 70%, 70%)' },
    ],
  },
];
