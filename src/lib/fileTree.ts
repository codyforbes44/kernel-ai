import type { ProjectFile, FileTreeNode } from '@/types/builder';

/**
 * Build file tree from flat file list
 * Converts a flat array of files into a hierarchical tree structure
 */
export function buildFileTree(files: ProjectFile[]): FileTreeNode[] {
  const tree: FileTreeNode[] = [];
  const folderMap = new Map<string, FileTreeNode>();

  // Sort files so folders come first, then alphabetically
  const sorted = [...files].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  for (const file of sorted) {
    const parts = file.path.split('/').filter(Boolean);
    let currentPath = '';
    let currentLevel = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath += '/' + part;
      const isLast = i === parts.length - 1;

      if (isLast) {
        // This is the actual file/folder
        currentLevel.push({
          id: file.id,
          name: file.name,
          path: file.path,
          type: file.type,
          language: file.language || undefined,
          children: file.type === 'folder' ? [] : undefined,
        });
      } else {
        // This is an intermediate folder
        let folder = folderMap.get(currentPath);
        if (!folder) {
          folder = {
            id: `folder-${currentPath}`,
            name: part,
            path: currentPath,
            type: 'folder',
            children: [],
          };
          folderMap.set(currentPath, folder);
          currentLevel.push(folder);
        }
        currentLevel = folder.children!;
      }
    }
  }

  return tree;
}
