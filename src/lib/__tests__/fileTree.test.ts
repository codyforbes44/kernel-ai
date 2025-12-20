import { describe, it, expect } from 'vitest';
import { buildFileTree } from '../fileTree';
import type { ProjectFile } from '@/types/builder';

// Helper to create a minimal ProjectFile for testing
const createFile = (overrides: Partial<ProjectFile> & Pick<ProjectFile, 'id' | 'name' | 'path' | 'type'>): ProjectFile => ({
  project_id: 'p1',
  content: null,
  language: null,
  is_entry_point: false,
  metadata: {},
  created_at: '',
  updated_at: '',
  ...overrides,
});

describe('buildFileTree', () => {
  it('returns empty array for empty input', () => {
    const result = buildFileTree([]);
    expect(result).toEqual([]);
  });

  it('builds a flat file list correctly', () => {
    const files: ProjectFile[] = [
      createFile({ id: '1', name: 'index.ts', path: '/index.ts', type: 'file', language: 'typescript' }),
      createFile({ id: '2', name: 'app.tsx', path: '/app.tsx', type: 'file', language: 'typescriptreact' }),
    ];

    const result = buildFileTree(files);
    
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('index.ts');
    expect(result[1].name).toBe('app.tsx');
  });

  it('creates folder structure for nested files', () => {
    const files: ProjectFile[] = [
      createFile({ id: '1', name: 'src', path: '/src', type: 'folder' }),
      createFile({ id: '2', name: 'index.ts', path: '/src/index.ts', type: 'file', language: 'typescript' }),
    ];

    const result = buildFileTree(files);
    
    expect(result).toHaveLength(2);
    const srcFolder = result.find(n => n.name === 'src');
    expect(srcFolder).toBeDefined();
    expect(srcFolder?.type).toBe('folder');
    expect(srcFolder?.children).toEqual([]);
  });

  it('creates intermediate folders for deeply nested files', () => {
    const files: ProjectFile[] = [
      createFile({ id: '1', name: 'Button.tsx', path: '/src/components/ui/Button.tsx', type: 'file', language: 'typescriptreact' }),
    ];

    const result = buildFileTree(files);
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('src');
    expect(result[0].type).toBe('folder');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children?.[0].name).toBe('components');
    expect(result[0].children?.[0].children?.[0].name).toBe('ui');
    expect(result[0].children?.[0].children?.[0].children?.[0].name).toBe('Button.tsx');
  });

  it('sorts folders before files', () => {
    const files: ProjectFile[] = [
      createFile({ id: '1', name: 'index.ts', path: '/index.ts', type: 'file' }),
      createFile({ id: '2', name: 'src', path: '/src', type: 'folder' }),
      createFile({ id: '3', name: 'config.json', path: '/config.json', type: 'file' }),
    ];

    const result = buildFileTree(files);
    
    // Folder should come first
    expect(result[0].name).toBe('src');
    expect(result[0].type).toBe('folder');
  });

  it('sorts alphabetically within same type', () => {
    const files: ProjectFile[] = [
      createFile({ id: '1', name: 'zebra.ts', path: '/zebra.ts', type: 'file' }),
      createFile({ id: '2', name: 'alpha.ts', path: '/alpha.ts', type: 'file' }),
      createFile({ id: '3', name: 'beta.ts', path: '/beta.ts', type: 'file' }),
    ];

    const result = buildFileTree(files);
    
    expect(result[0].name).toBe('alpha.ts');
    expect(result[1].name).toBe('beta.ts');
    expect(result[2].name).toBe('zebra.ts');
  });

  it('handles files with language property', () => {
    const files: ProjectFile[] = [
      createFile({ id: '1', name: 'style.css', path: '/style.css', type: 'file', language: 'css' }),
    ];

    const result = buildFileTree(files);
    
    expect(result[0].language).toBe('css');
  });

  it('handles files without language property', () => {
    const files: ProjectFile[] = [
      createFile({ id: '1', name: 'README.md', path: '/README.md', type: 'file', language: null }),
    ];

    const result = buildFileTree(files);
    
    expect(result[0].language).toBeUndefined();
  });

  it('preserves file id correctly', () => {
    const files: ProjectFile[] = [
      createFile({ id: 'unique-id-123', name: 'test.ts', path: '/test.ts', type: 'file' }),
    ];

    const result = buildFileTree(files);
    
    expect(result[0].id).toBe('unique-id-123');
  });

  it('generates synthetic folder ids for intermediate folders', () => {
    const files: ProjectFile[] = [
      createFile({ id: '1', name: 'file.ts', path: '/a/b/file.ts', type: 'file' }),
    ];

    const result = buildFileTree(files);
    
    expect(result[0].id).toBe('folder-/a');
    expect(result[0].children?.[0].id).toBe('folder-/a/b');
  });

  it('does not duplicate folders with same path', () => {
    const files: ProjectFile[] = [
      createFile({ id: '1', name: 'a.ts', path: '/src/a.ts', type: 'file' }),
      createFile({ id: '2', name: 'b.ts', path: '/src/b.ts', type: 'file' }),
    ];

    const result = buildFileTree(files);
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('src');
    expect(result[0].children).toHaveLength(2);
  });
});
