import type { VisualChange } from '@/types/visual-editor';
import type { ProjectFile } from '@/types/builder';

interface ApplyChangesResult {
  fileId: string;
  filePath: string;
  oldContent: string;
  newContent: string;
}

/**
 * Apply visual editor changes to source code files.
 * This function takes pending changes and modifies the actual source code.
 */
export function applyVisualChangesToSource(
  changes: VisualChange[],
  files: ProjectFile[]
): ApplyChangesResult[] {
  const results: ApplyChangesResult[] = [];
  const fileChanges = new Map<string, { file: ProjectFile; changes: VisualChange[] }>();

  // Group changes by file
  for (const change of changes) {
    // Try to find file by source mapping first
    let targetFile: ProjectFile | undefined;
    
    if (change.sourceMapping?.filePath) {
      targetFile = files.find(f => 
        f.path === change.sourceMapping!.filePath || 
        f.path === `/${change.sourceMapping!.filePath}`
      );
    }

    // If no source mapping, try to find the likely file (App.tsx or similar)
    if (!targetFile) {
      targetFile = files.find(f => 
        f.path.includes('App.tsx') || 
        f.path.includes('App.jsx') ||
        f.path.includes('index.tsx')
      );
    }

    if (targetFile && targetFile.content) {
      const existing = fileChanges.get(targetFile.id) || { file: targetFile, changes: [] };
      existing.changes.push(change);
      fileChanges.set(targetFile.id, existing);
    }
  }

  // Apply changes to each file
  for (const [fileId, { file, changes: fileChangesList }] of fileChanges) {
    const oldContent = file.content || '';
    let newContent = oldContent;

    for (const change of fileChangesList) {
      newContent = applyChangeToContent(newContent, change);
    }

    if (newContent !== oldContent) {
      results.push({
        fileId,
        filePath: file.path,
        oldContent,
        newContent,
      });
    }
  }

  return results;
}

/**
 * Apply a single visual change to file content
 */
function applyChangeToContent(content: string, change: VisualChange): string {
  switch (change.type) {
    case 'class':
      return applyClassChange(content, change);
    case 'text':
      return applyTextChange(content, change);
    case 'style':
      return applyStyleChange(content, change);
    default:
      return content;
  }
}

/**
 * Apply className changes to JSX
 */
function applyClassChange(content: string, change: VisualChange): string {
  const { oldValue, newValue, elementSelector } = change;
  
  if (!oldValue || !newValue) return content;
  
  // Escape special regex characters in the old value
  const escapedOldValue = oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Try to find and replace className with the old value
  // Handle both className="..." and className={...}
  const classNameRegex = new RegExp(
    `(className\\s*=\\s*["'\`])${escapedOldValue}(["'\`])`,
    'g'
  );
  
  const newContent = content.replace(classNameRegex, `$1${newValue}$2`);
  
  // If no replacement was made, try to find the classes and update them
  if (newContent === content) {
    // Try partial class replacement
    const oldClasses = oldValue.split(/\s+/).filter(Boolean);
    const newClasses = newValue.split(/\s+/).filter(Boolean);
    
    // Find classes that were added or removed
    const addedClasses = newClasses.filter(c => !oldClasses.includes(c));
    const removedClasses = oldClasses.filter(c => !newClasses.includes(c));
    
    let result = content;
    
    // Remove old classes
    for (const cls of removedClasses) {
      const clsRegex = new RegExp(`\\b${cls}\\b\\s*`, 'g');
      result = result.replace(clsRegex, '');
    }
    
    // Add new classes - find a className that contains some of the old classes
    if (addedClasses.length > 0) {
      const classesToAdd = addedClasses.join(' ');
      
      // Try to append to existing className
      for (const oldClass of oldClasses) {
        const appendRegex = new RegExp(
          `(className\\s*=\\s*["'\`][^"'\`]*\\b${oldClass}\\b[^"'\`]*)(["'\`])`,
          'g'
        );
        
        if (appendRegex.test(result)) {
          result = result.replace(appendRegex, `$1 ${classesToAdd}$2`);
          break;
        }
      }
    }
    
    // Clean up multiple spaces
    result = result.replace(/\s{2,}/g, ' ').replace(/"\s+"/g, '""');
    
    return result;
  }
  
  return newContent;
}

/**
 * Apply text content changes to JSX
 */
function applyTextChange(content: string, change: VisualChange): string {
  const { oldValue, newValue } = change;
  
  if (!oldValue || !newValue || oldValue === newValue) return content;
  
  // Escape special regex characters
  const escapedOldValue = oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Replace text content within JSX tags
  // Match text that appears between > and <
  const textRegex = new RegExp(`(>\\s*)${escapedOldValue}(\\s*<)`, 'g');
  
  return content.replace(textRegex, `$1${newValue}$2`);
}

/**
 * Apply inline style changes to JSX
 */
function applyStyleChange(content: string, change: VisualChange): string {
  const { property, newValue, elementSelector } = change;
  
  if (!property || !newValue) return content;
  
  // Convert CSS property to JSX style property (camelCase)
  const jsxProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  
  // Try to find existing style prop and update it
  const styleRegex = new RegExp(
    `(style\\s*=\\s*\\{\\{[^}]*)(${jsxProperty}\\s*:\\s*["']?)[^,"'}]+`,
    'g'
  );
  
  const hasExistingStyle = styleRegex.test(content);
  
  if (hasExistingStyle) {
    return content.replace(styleRegex, `$1$2${newValue}`);
  }
  
  // If no existing style with this property, we'd need more complex AST manipulation
  // For now, return unchanged
  return content;
}

/**
 * Generate a diff summary for the changes
 */
export function generateChangesSummary(changes: VisualChange[]): string {
  const summary: string[] = [];
  
  for (const change of changes) {
    switch (change.type) {
      case 'class':
        summary.push(`Updated classes on ${change.elementSelector}`);
        break;
      case 'text':
        summary.push(`Changed text: "${change.oldValue.substring(0, 20)}..." → "${change.newValue.substring(0, 20)}..."`);
        break;
      case 'style':
        summary.push(`Updated ${change.property}: ${change.newValue}`);
        break;
    }
  }
  
  return summary.join('\n');
}
