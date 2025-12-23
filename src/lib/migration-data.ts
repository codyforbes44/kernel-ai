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

export function detectPlatformFromFiles(files: File[]): MigrationPlatform | null {
  for (const platform of migrationPlatforms) {
    for (const file of files) {
      for (const pattern of platform.filePatterns) {
        if (file.name.includes(pattern) || file.webkitRelativePath?.includes(pattern)) {
          return platform;
        }
      }
    }
  }
  return null;
}

export function detectPlatformFromUrl(url: string): MigrationPlatform | null {
  for (const platform of migrationPlatforms) {
    if (platform.urlPattern && platform.urlPattern.test(url)) {
      return platform;
    }
  }
  return null;
}
