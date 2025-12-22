import type { VisualChange } from '@/types/visual-editor';
import type { ProjectFile } from '@/types/builder';

interface ApplyChangesResult {
  fileId: string;
  filePath: string;
  oldContent: string;
  newContent: string;
}

interface LineEdit {
  lineNumber: number;
  oldLine: string;
  newLine: string;
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

  // Group changes by file using source mapping
  for (const change of changes) {
    let targetFile: ProjectFile | undefined;
    
    // Use source mapping for precise file location
    if (change.sourceMapping?.filePath) {
      const mappedPath = change.sourceMapping.filePath;
      targetFile = files.find(f => {
        const filePath = f.path.replace(/^\//, '');
        return filePath === mappedPath || f.path === `/${mappedPath}`;
      });
    }

    // Fallback: try to find the likely file (App.tsx or similar)
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

    // Sort changes by line number in reverse order so we can apply from bottom to top
    // This prevents line number shifts from affecting subsequent changes
    const sortedChanges = [...fileChangesList].sort((a, b) => {
      const lineA = a.sourceMapping?.lineNumber || 0;
      const lineB = b.sourceMapping?.lineNumber || 0;
      return lineB - lineA; // Descending order
    });

    for (const change of sortedChanges) {
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
 * Apply className changes to JSX using line number for precision
 */
function applyClassChange(content: string, change: VisualChange): string {
  const { oldValue, newValue, sourceMapping } = change;
  
  if (!oldValue || !newValue) return content;
  
  const lines = content.split('\n');
  
  // If we have source mapping with line number, target that specific line
  if (sourceMapping?.lineNumber && sourceMapping.lineNumber <= lines.length) {
    const targetLineIndex = sourceMapping.lineNumber - 1;
    const targetLine = lines[targetLineIndex];
    
    // Try multiple patterns for className
    const patterns = [
      // className="..." or className='...'
      { regex: /(className\s*=\s*["'])([^"']*)(["'])/, replacement: `$1${newValue}$3` },
      // className={`...`} (template literal)
      { regex: /(className\s*=\s*\{\s*`)([^`]*)(`\s*\})/, replacement: `$1${newValue}$3` },
      // className={"..."} or className={'...'}
      { regex: /(className\s*=\s*\{\s*["'])([^"']*)(["']\s*\})/, replacement: `$1${newValue}$3` },
    ];
    
    for (const { regex, replacement } of patterns) {
      if (regex.test(targetLine)) {
        lines[targetLineIndex] = targetLine.replace(regex, replacement);
        return lines.join('\n');
      }
    }
    
    // If no className found on this line, search nearby lines (element might span multiple lines)
    const searchRange = 5;
    for (let offset = 1; offset <= searchRange; offset++) {
      for (const direction of [-1, 1]) {
        const searchLineIndex = targetLineIndex + (offset * direction);
        if (searchLineIndex >= 0 && searchLineIndex < lines.length) {
          const searchLine = lines[searchLineIndex];
          for (const { regex, replacement } of patterns) {
            if (regex.test(searchLine)) {
              lines[searchLineIndex] = searchLine.replace(regex, replacement);
              return lines.join('\n');
            }
          }
        }
      }
    }
  }
  
  // Fallback: global search for exact className match
  const escapedOldValue = escapeRegex(oldValue);
  const classNameRegex = new RegExp(
    `(className\\s*=\\s*["'])${escapedOldValue}(["'])`,
    'g'
  );
  
  return content.replace(classNameRegex, `$1${newValue}$2`);
}

/**
 * Apply text content changes to JSX with line-targeted precision
 */
function applyTextChange(content: string, change: VisualChange): string {
  const { oldValue, newValue, sourceMapping } = change;
  
  if (!oldValue || !newValue || oldValue === newValue) return content;
  
  const lines = content.split('\n');
  
  // If we have source mapping, search from that line
  if (sourceMapping?.lineNumber && sourceMapping.lineNumber <= lines.length) {
    const startLineIndex = sourceMapping.lineNumber - 1;
    const searchRange = 10;
    
    // Look for the text content in nearby lines
    for (let offset = 0; offset <= searchRange; offset++) {
      for (const direction of [0, -1, 1]) {
        if (offset === 0 && direction !== 0) continue;
        
        const searchLineIndex = startLineIndex + (offset * direction);
        if (searchLineIndex < 0 || searchLineIndex >= lines.length) continue;
        
        const line = lines[searchLineIndex];
        
        // Pattern 1: Text between tags on same line: >text<
        if (line.includes(oldValue)) {
          const escapedOldValue = escapeRegex(oldValue);
          
          // Match text between > and <
          const textBetweenTags = new RegExp(`(>\\s*)${escapedOldValue}(\\s*<)`, 'g');
          if (textBetweenTags.test(line)) {
            lines[searchLineIndex] = line.replace(textBetweenTags, `$1${escapeReplacement(newValue)}$2`);
            return lines.join('\n');
          }
          
          // Match text as direct content (not in an attribute)
          // Make sure we're not in a string attribute
          if (!line.includes(`"${oldValue}"`) && !line.includes(`'${oldValue}'`)) {
            const directText = new RegExp(`(^\\s*)${escapedOldValue}(\\s*$)`);
            if (directText.test(line)) {
              lines[searchLineIndex] = line.replace(directText, `$1${escapeReplacement(newValue)}$2`);
              return lines.join('\n');
            }
            
            // Simple text replacement if it appears to be JSX content
            const simpleReplace = line.replace(oldValue, newValue);
            if (simpleReplace !== line && !isInsideAttribute(line, line.indexOf(oldValue))) {
              lines[searchLineIndex] = simpleReplace;
              return lines.join('\n');
            }
          }
        }
      }
    }
  }
  
  // Fallback: try global replacement for text between tags
  const escapedOldValue = escapeRegex(oldValue);
  const textRegex = new RegExp(`(>\\s*)${escapedOldValue}(\\s*<)`, 'g');
  
  return content.replace(textRegex, `$1${escapeReplacement(newValue)}$2`);
}

/**
 * Check if a position in a line is inside an attribute value
 */
function isInsideAttribute(line: string, position: number): boolean {
  if (position < 0) return false;
  
  const before = line.substring(0, position);
  
  // Count quotes before this position
  const doubleQuotes = (before.match(/"/g) || []).length;
  const singleQuotes = (before.match(/'/g) || []).length;
  
  // If odd number of quotes, we're inside a string
  return (doubleQuotes % 2 !== 0) || (singleQuotes % 2 !== 0);
}

/**
 * Apply inline style changes to JSX
 */
function applyStyleChange(content: string, change: VisualChange): string {
  const { property, newValue, sourceMapping } = change;
  
  if (!property || !newValue) return content;
  
  // Convert CSS property to JSX style property (camelCase)
  const jsxProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  
  const lines = content.split('\n');
  
  if (sourceMapping?.lineNumber && sourceMapping.lineNumber <= lines.length) {
    const startLineIndex = sourceMapping.lineNumber - 1;
    const searchRange = 10;
    
    // Look for style attribute in nearby lines
    for (let offset = 0; offset <= searchRange; offset++) {
      for (const direction of [0, -1, 1]) {
        if (offset === 0 && direction !== 0) continue;
        
        const searchLineIndex = startLineIndex + (offset * direction);
        if (searchLineIndex < 0 || searchLineIndex >= lines.length) continue;
        
        const line = lines[searchLineIndex];
        
        // Check for existing style property
        const existingPropRegex = new RegExp(
          `(style\\s*=\\s*\\{\\{[^}]*)(${jsxProperty}\\s*:\\s*)["']?[^,"'}]+["']?`,
          'g'
        );
        
        if (existingPropRegex.test(line)) {
          lines[searchLineIndex] = line.replace(
            existingPropRegex,
            `$1$2"${newValue}"`
          );
          return lines.join('\n');
        }
        
        // If style={{ exists but property doesn't, add it
        const styleOpenRegex = /(style\s*=\s*\{\{)/;
        if (styleOpenRegex.test(line) && !line.includes(jsxProperty)) {
          lines[searchLineIndex] = line.replace(
            styleOpenRegex,
            `$1 ${jsxProperty}: "${newValue}",`
          );
          return lines.join('\n');
        }
      }
    }
    
    // If no style found, we need to add one to the element
    // Find the opening tag near the source mapping line
    const targetLine = lines[startLineIndex];
    const tagMatch = targetLine.match(/(<[a-zA-Z][a-zA-Z0-9]*)/);
    if (tagMatch) {
      // Add style prop after tag name
      lines[startLineIndex] = targetLine.replace(
        /(<[a-zA-Z][a-zA-Z0-9]*)(\s|>)/,
        `$1 style={{ ${jsxProperty}: "${newValue}" }}$2`
      );
      return lines.join('\n');
    }
  }
  
  return content;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Escape special replacement characters
 */
function escapeReplacement(str: string): string {
  return str.replace(/\$/g, '$$$$');
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
      case 'text': {
        const oldText = change.oldValue.length > 20 ? change.oldValue.substring(0, 20) + '...' : change.oldValue;
        const newText = change.newValue.length > 20 ? change.newValue.substring(0, 20) + '...' : change.newValue;
        summary.push(`Changed text: "${oldText}" → "${newText}"`);
        break;
      }
      case 'style':
        summary.push(`Updated ${change.property}: ${change.newValue}`);
        break;
    }
  }
  
  return summary.join('\n');
}

/**
 * Validate that changes can be applied to the source
 */
export function validateChanges(changes: VisualChange[], files: ProjectFile[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const change of changes) {
    if (!change.sourceMapping?.filePath) {
      errors.push(`Change to ${change.elementSelector} has no source mapping`);
      continue;
    }
    
    const file = files.find(f => {
      const filePath = f.path.replace(/^\//, '');
      return filePath === change.sourceMapping!.filePath || f.path === `/${change.sourceMapping!.filePath}`;
    });
    
    if (!file) {
      errors.push(`Source file not found: ${change.sourceMapping.filePath}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
