/**
 * JSX Source Mapper
 * 
 * Transforms JSX/TSX files to inject data attributes for source mapping.
 * This enables the visual editor to precisely locate elements in source code.
 */

interface SourceMapping {
  filePath: string;
  lineNumber: number;
  columnNumber: number;
  elementId: string;
}

/**
 * Inject source mapping data attributes into JSX elements.
 * This transforms JSX to add data-lovable-* attributes for visual editor tracking.
 */
export function injectSourceMapping(content: string, filePath: string): string {
  // Only process JSX/TSX files
  if (!filePath.match(/\.(jsx|tsx)$/)) {
    return content;
  }

  let elementCounter = 0;
  const lines = content.split('\n');
  const result: string[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    let line = lines[lineIndex];
    const lineNumber = lineIndex + 1;
    
    // Find JSX opening tags and inject data attributes
    line = processLine(line, filePath, lineNumber, () => {
      elementCounter++;
      return `${filePath.replace(/^\//, '')}-${lineNumber}-${elementCounter}`;
    });
    
    result.push(line);
  }

  return result.join('\n');
}

/**
 * Process a single line to inject source mapping into JSX tags
 */
function processLine(
  line: string, 
  filePath: string, 
  lineNumber: number,
  generateId: () => string
): string {
  // Match JSX opening tags (but not self-closing fragments or components without attributes)
  // This regex matches: <tagName or <TagName followed by space, > or attributes
  const jsxTagRegex = /(<[a-zA-Z][a-zA-Z0-9]*)([\s>])/g;
  
  let match;
  let result = line;
  let offset = 0;
  
  // Find all JSX tags in the line
  const matches: Array<{ index: number; tag: string; suffix: string }> = [];
  while ((match = jsxTagRegex.exec(line)) !== null) {
    const tag = match[1];
    const suffix = match[2];
    
    // Skip certain tags
    if (shouldSkipTag(tag)) {
      continue;
    }
    
    matches.push({
      index: match.index,
      tag,
      suffix,
    });
  }
  
  // Process matches in reverse order to maintain correct indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const { index, tag, suffix } = matches[i];
    const elementId = generateId();
    const columnNumber = index + 1;
    
    // Create data attributes
    const dataAttrs = createDataAttributes(filePath, lineNumber, columnNumber, elementId);
    
    // Inject attributes
    if (suffix === '>') {
      // Tag closes immediately: <div> -> <div data-attrs>
      result = result.slice(0, index + tag.length) + ' ' + dataAttrs + result.slice(index + tag.length);
    } else {
      // Tag has space/attributes: <div className -> <div data-attrs className
      result = result.slice(0, index + tag.length) + ' ' + dataAttrs + result.slice(index + tag.length);
    }
  }
  
  return result;
}

/**
 * Check if a tag should be skipped for source mapping
 */
function shouldSkipTag(tag: string): boolean {
  const skipTags = [
    '<React',
    '<Fragment',
    '<Suspense',
    '<StrictMode',
    '<Provider',
    '<Router',
    '<Route',
    '<Switch',
    '<Link',
    '<NavLink',
    '<Outlet',
    '<ErrorBoundary',
  ];
  
  return skipTags.some(skip => tag.startsWith(skip));
}

/**
 * Create data attribute string for source mapping
 */
function createDataAttributes(
  filePath: string, 
  lineNumber: number, 
  columnNumber: number, 
  elementId: string
): string {
  // Clean file path for attribute
  const cleanPath = filePath.replace(/^\//, '');
  
  return `data-lovable-id="${elementId}" data-lovable-file="${cleanPath}" data-lovable-line="${lineNumber}" data-lovable-col="${columnNumber}"`;
}

/**
 * Generate a unique element ID
 */
export function generateElementId(filePath: string, lineNumber: number, index: number): string {
  const cleanPath = filePath.replace(/[^a-zA-Z0-9]/g, '_');
  return `${cleanPath}_${lineNumber}_${index}`;
}

/**
 * Parse source mapping from data attributes
 */
export function parseSourceMapping(element: HTMLElement): SourceMapping | null {
  const id = element.dataset.lovableId;
  const file = element.dataset.lovableFile;
  const line = element.dataset.lovableLine;
  const col = element.dataset.lovableCol;
  
  if (!id || !file || !line) {
    return null;
  }
  
  return {
    elementId: id,
    filePath: file,
    lineNumber: parseInt(line, 10),
    columnNumber: parseInt(col || '0', 10),
  };
}

/**
 * Build a source location string for display
 */
export function formatSourceLocation(mapping: SourceMapping): string {
  return `${mapping.filePath}:${mapping.lineNumber}:${mapping.columnNumber}`;
}
