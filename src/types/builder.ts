export interface BuilderProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  framework: string;
  template: string;
  settings: Record<string, unknown>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  path: string;
  name: string;
  type: 'file' | 'folder';
  content: string | null;
  language: string | null;
  is_entry_point: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FileVersion {
  id: string;
  file_id: string;
  content: string;
  version_number: number;
  created_at: string;
  message: string | null;
}

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  language?: string;
  children?: FileTreeNode[];
  isOpen?: boolean;
}

export interface OpenTab {
  id: string;
  path: string;
  name: string;
  language: string | null;
  isDirty: boolean;
}

export interface BuilderState {
  project: BuilderProject | null;
  files: ProjectFile[];
  openTabs: OpenTab[];
  activeTabId: string | null;
  fileTree: FileTreeNode[];
}

// Language detection helper
export function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    html: 'html',
    css: 'css',
    scss: 'scss',
    md: 'markdown',
    sql: 'sql',
    yaml: 'yaml',
    yml: 'yaml',
  };
  return langMap[ext || ''] || 'plaintext';
}

// File icon helper
export function getFileIcon(name: string, type: 'file' | 'folder'): string {
  if (type === 'folder') return '📁';
  
  const ext = name.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    ts: '🔷',
    tsx: '⚛️',
    js: '🟨',
    jsx: '⚛️',
    json: '📋',
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    md: '📝',
    sql: '🗃️',
    png: '🖼️',
    jpg: '🖼️',
    svg: '🖼️',
  };
  return iconMap[ext || ''] || '📄';
}
