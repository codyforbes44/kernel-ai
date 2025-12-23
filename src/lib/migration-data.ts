// Migration data for competitor platforms
import { Zap, Palette, Code2, Terminal, Github, FileCode2, LucideIcon } from 'lucide-react';

export type ImportMethod = 'zip' | 'github' | 'paste' | 'url';

export interface MigrationPlatform {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  importMethods: ImportMethod[];
  featuresGained: string[];
  migrationTips: string[];
  filePatterns: string[];
  urlPattern?: RegExp;
}

export const migrationPlatforms: MigrationPlatform[] = [
  {
    id: 'bolt',
    name: 'Bolt.new',
    description: 'AI-powered full-stack development',
    icon: Zap,
    color: 'hsl(45, 100%, 51%)',
    gradient: 'from-yellow-500 to-orange-500',
    importMethods: ['zip', 'github', 'url'],
    featuresGained: [
      'Component Marketplace with 100+ pre-built components',
      'Advanced Design System Builder',
      'Real-time collaboration with live cursors',
      'AI Image Generation built-in',
      'Version history with visual diffs',
    ],
    migrationTips: [
      'Export your project as a ZIP from Bolt',
      'Your dependencies will be automatically detected',
      'Environment variables can be added in project settings',
    ],
    filePatterns: ['.bolt', 'bolt.config'],
    urlPattern: /bolt\.new\/[a-zA-Z0-9-]+/,
  },
  {
    id: 'v0',
    name: 'v0 by Vercel',
    description: 'AI UI component generator',
    icon: Palette,
    color: 'hsl(0, 0%, 0%)',
    gradient: 'from-zinc-700 to-zinc-900',
    importMethods: ['paste', 'url'],
    featuresGained: [
      'Full project scaffolding, not just components',
      'Database integration with Lovable Cloud',
      'Edge functions for backend logic',
      'Built-in authentication system',
      'One-click deployment with custom domains',
    ],
    migrationTips: [
      'Copy your component code from v0',
      'Paste directly and we\'ll set up the full project structure',
      'Your shadcn components are fully compatible',
    ],
    filePatterns: [],
    urlPattern: /v0\.dev\/chat\/[a-zA-Z0-9-]+/,
  },
  {
    id: 'replit',
    name: 'Replit',
    description: 'Collaborative browser IDE',
    icon: Terminal,
    color: 'hsl(24, 100%, 50%)',
    gradient: 'from-orange-500 to-red-500',
    importMethods: ['zip', 'github'],
    featuresGained: [
      'AI-powered code generation and editing',
      'Visual drag-and-drop builder',
      'Integrated design system management',
      'Component versioning and rollback',
      'Native mobile responsiveness testing',
    ],
    migrationTips: [
      'Download your Replit project as a ZIP',
      'React/Vite projects work seamlessly',
      'Python/Node backends need to be converted to Edge Functions',
    ],
    filePatterns: ['.replit', 'replit.nix'],
  },
  {
    id: 'lovable',
    name: 'Lovable',
    description: 'AI-powered app builder',
    icon: Code2,
    color: 'hsl(280, 100%, 60%)',
    gradient: 'from-purple-500 to-pink-500',
    importMethods: ['github', 'zip'],
    featuresGained: [
      'Enhanced AI with multi-model support',
      'Larger context window for complex projects',
      'Advanced agent mode with autonomous building',
      'Better error recovery and debugging',
      'Priority support and faster responses',
    ],
    migrationTips: [
      'Connect your GitHub repo directly',
      'Your Supabase connection carries over',
      'All shadcn components are compatible',
    ],
    filePatterns: [],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'AI-first code editor',
    icon: FileCode2,
    color: 'hsl(210, 100%, 50%)',
    gradient: 'from-blue-500 to-cyan-500',
    importMethods: ['github', 'zip'],
    featuresGained: [
      'No local setup required',
      'Instant preview and hot reload',
      'Built-in database and storage',
      'Team collaboration in real-time',
      'One-click cloud deployment',
    ],
    migrationTips: [
      'Push your project to GitHub first',
      'Or export as ZIP from your local folder',
      'All npm dependencies auto-install',
    ],
    filePatterns: ['.cursorrules'],
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Import from any repository',
    icon: Github,
    color: 'hsl(0, 0%, 20%)',
    gradient: 'from-gray-700 to-gray-900',
    importMethods: ['github'],
    featuresGained: [
      'AI-powered development assistant',
      'Visual editing and component builder',
      'Integrated backend with Lovable Cloud',
      'Automatic deployments on changes',
      'Built-in auth and database',
    ],
    migrationTips: [
      'Connect your GitHub account',
      'Select the repository to import',
      'We\'ll auto-detect your framework',
    ],
    filePatterns: [],
  },
];

export interface KernelFeature {
  id: string;
  title: string;
  description: string;
  category: 'ai' | 'builder' | 'backend' | 'deploy' | 'collab';
}

export const kernelFeatures: KernelFeature[] = [
  {
    id: 'ai-chat',
    title: 'AI Chat Assistant',
    description: 'Natural language to code with context awareness',
    category: 'ai',
  },
  {
    id: 'agent-mode',
    title: 'Agent Mode',
    description: 'Autonomous multi-step task execution',
    category: 'ai',
  },
  {
    id: 'image-gen',
    title: 'AI Image Generation',
    description: 'Generate assets directly in your project',
    category: 'ai',
  },
  {
    id: 'visual-editor',
    title: 'Visual Editor',
    description: 'Point-and-click editing with live preview',
    category: 'builder',
  },
  {
    id: 'design-system',
    title: 'Design System Builder',
    description: 'Create and manage your design tokens',
    category: 'builder',
  },
  {
    id: 'marketplace',
    title: 'Component Marketplace',
    description: 'Install pre-built components instantly',
    category: 'builder',
  },
  {
    id: 'database',
    title: 'Integrated Database',
    description: 'PostgreSQL with visual schema editor',
    category: 'backend',
  },
  {
    id: 'edge-functions',
    title: 'Edge Functions',
    description: 'Serverless backend logic',
    category: 'backend',
  },
  {
    id: 'auth',
    title: 'Built-in Auth',
    description: 'Email, OAuth, and magic links',
    category: 'backend',
  },
  {
    id: 'storage',
    title: 'File Storage',
    description: 'Secure file uploads and CDN',
    category: 'backend',
  },
  {
    id: 'deploy',
    title: 'One-Click Deploy',
    description: 'Instant deployments with custom domains',
    category: 'deploy',
  },
  {
    id: 'rollback',
    title: 'Version Rollback',
    description: 'Restore any previous deployment',
    category: 'deploy',
  },
  {
    id: 'collab',
    title: 'Real-time Collaboration',
    description: 'Live cursors and presence',
    category: 'collab',
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base',
    description: 'Custom AI context for your project',
    category: 'collab',
  },
];

export const importMethodLabels: Record<ImportMethod, { label: string; description: string }> = {
  zip: {
    label: 'Upload ZIP File',
    description: 'Drag and drop your project ZIP file',
  },
  github: {
    label: 'Import from GitHub',
    description: 'Connect and import from a repository',
  },
  paste: {
    label: 'Paste Code',
    description: 'Paste component or project code directly',
  },
  url: {
    label: 'Import from URL',
    description: 'Enter a project or share URL',
  },
};

export interface DetectionResult {
  platform: MigrationPlatform | null;
  confidence: 'high' | 'medium' | 'low';
  matchedPatterns: string[];
  detectedFramework: string | null;
  fileStats: {
    total: number;
    components: number;
    configs: number;
    styles: number;
  };
}

// Comprehensive file pattern detection
const detectionPatterns: Record<string, { patterns: string[]; weight: number }> = {
  bolt: {
    patterns: ['.bolt', 'bolt.config', '.bolt.json', 'bolt-lock.yaml'],
    weight: 10,
  },
  replit: {
    patterns: ['.replit', 'replit.nix', '.replit.json', 'replit.toml'],
    weight: 10,
  },
  cursor: {
    patterns: ['.cursorrules', '.cursor', 'cursor.json'],
    weight: 10,
  },
  lovable: {
    patterns: ['lovable.json', '.lovable', 'supabase/config.toml'],
    weight: 8,
  },
  v0: {
    patterns: ['v0.json', '.v0'],
    weight: 10,
  },
};

// Content-based detection patterns (check inside files)
const contentPatterns: Record<string, { content: string[]; weight: number }> = {
  bolt: {
    content: ['@bolt/', 'bolt.new', 'stackblitz'],
    weight: 5,
  },
  replit: {
    content: ['replit.com', '@replit/', 'REPL_'],
    weight: 5,
  },
  v0: {
    content: ['v0.dev', '@vercel/v0', 'shadcn'],
    weight: 3,
  },
  lovable: {
    content: ['lovable.dev', '@lovable/', 'supabase'],
    weight: 3,
  },
};

// Framework detection patterns
const frameworkPatterns: Record<string, string[]> = {
  'Next.js': ['next.config.js', 'next.config.ts', 'next.config.mjs', '.next'],
  'Vite + React': ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'],
  'Create React App': ['react-scripts', 'react-app-env.d.ts'],
  'Remix': ['remix.config.js', 'remix.config.ts'],
  'Astro': ['astro.config.mjs', 'astro.config.ts'],
  'SvelteKit': ['svelte.config.js', 'svelte.config.ts'],
  'Vue': ['vue.config.js', 'vite.config.ts'],
  'Angular': ['angular.json', 'angular.cli.json'],
};

export async function detectPlatformFromFiles(files: File[]): Promise<DetectionResult> {
  const scores: Record<string, number> = {};
  const matchedPatterns: string[] = [];
  let detectedFramework: string | null = null;
  
  const fileStats = {
    total: files.length,
    components: 0,
    configs: 0,
    styles: 0,
  };

  // Get all file paths
  const filePaths = files.map(f => f.webkitRelativePath || f.name);
  const fileNames = files.map(f => f.name.toLowerCase());

  // Check file name patterns
  for (const [platformId, config] of Object.entries(detectionPatterns)) {
    for (const pattern of config.patterns) {
      const found = filePaths.some(path => 
        path.toLowerCase().includes(pattern.toLowerCase())
      );
      if (found) {
        scores[platformId] = (scores[platformId] || 0) + config.weight;
        matchedPatterns.push(`File: ${pattern}`);
      }
    }
  }

  // Detect framework
  for (const [framework, patterns] of Object.entries(frameworkPatterns)) {
    const found = patterns.some(pattern => 
      fileNames.includes(pattern.toLowerCase())
    );
    if (found) {
      detectedFramework = framework;
      break;
    }
  }

  // Count file types
  for (const file of files) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.tsx') || name.endsWith('.jsx')) {
      fileStats.components++;
    } else if (name.endsWith('.json') || name.endsWith('.config.ts') || name.endsWith('.config.js')) {
      fileStats.configs++;
    } else if (name.endsWith('.css') || name.endsWith('.scss') || name.endsWith('.sass')) {
      fileStats.styles++;
    }
  }

  // Read content of key files for deeper detection
  const textFiles = files.filter(f => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    return ['json', 'js', 'ts', 'tsx', 'jsx', 'md', 'txt'].includes(ext || '');
  }).slice(0, 10); // Limit to first 10 text files

  for (const file of textFiles) {
    try {
      const content = await file.text();
      for (const [platformId, config] of Object.entries(contentPatterns)) {
        for (const pattern of config.content) {
          if (content.toLowerCase().includes(pattern.toLowerCase())) {
            scores[platformId] = (scores[platformId] || 0) + config.weight;
            if (!matchedPatterns.includes(`Content: ${pattern}`)) {
              matchedPatterns.push(`Content: ${pattern}`);
            }
          }
        }
      }
    } catch {
      // Skip files that can't be read
    }
  }

  // Find the platform with highest score
  let topPlatformId: string | null = null;
  let topScore = 0;
  for (const [platformId, score] of Object.entries(scores)) {
    if (score > topScore) {
      topScore = score;
      topPlatformId = platformId;
    }
  }

  // Determine confidence
  let confidence: DetectionResult['confidence'] = 'low';
  if (topScore >= 10) {
    confidence = 'high';
  } else if (topScore >= 5) {
    confidence = 'medium';
  }

  const platform = topPlatformId 
    ? migrationPlatforms.find(p => p.id === topPlatformId) || null 
    : null;

  return {
    platform,
    confidence,
    matchedPatterns,
    detectedFramework,
    fileStats,
  };
}

export function detectPlatformFromUrl(url: string): MigrationPlatform | null {
  for (const platform of migrationPlatforms) {
    if (platform.urlPattern && platform.urlPattern.test(url)) {
      return platform;
    }
  }
  return null;
}

// Quick sync detection for initial file drop (before async analysis)
export function quickDetectPlatform(files: File[]): MigrationPlatform | null {
  const filePaths = files.map(f => (f.webkitRelativePath || f.name).toLowerCase());
  
  for (const platform of migrationPlatforms) {
    for (const pattern of platform.filePatterns) {
      if (filePaths.some(path => path.includes(pattern.toLowerCase()))) {
        return platform;
      }
    }
  }
  return null;
}
