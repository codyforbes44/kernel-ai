import { 
  Rocket, 
  Code, 
  Database, 
  Shield, 
  Zap,
  Palette,
  GitBranch,
  Cloud,
  LucideIcon,
  BookOpen
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Rocket,
  Code,
  Database,
  Shield,
  Zap,
  Palette,
  GitBranch,
  Cloud,
  BookOpen,
};

export function getDocIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || BookOpen;
}
