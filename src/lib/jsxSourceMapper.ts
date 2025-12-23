/**
 * JSX Source Mapper
 * 
 * Transforms JSX/TSX files to inject data attributes for source mapping.
 * This enables the visual editor to precisely locate elements in source code.
 */

export interface SourceMapping {
  filePath: string;
  lineNumber: number;
  columnNumber: number;
  elementId: string;
}

// Track elements per file for consistent IDs across hot reloads
const elementCounters = new Map<string, number>();

/**
 * Reset element counters (call when files change significantly)
 */
export function resetSourceMappingCounters(): void {
  elementCounters.clear();
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

  // Reset counter for this file
  elementCounters.set(filePath, 0);

  const lines = content.split('\n');
  const result: string[] = [];
  let inJSXReturn = false;
  let braceDepth = 0;
  let parenDepth = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    let line = lines[lineIndex];
    const lineNumber = lineIndex + 1;
    
    // Track if we're in a return statement or JSX expression
    if (line.includes('return (') || line.includes('return(')) {
      inJSXReturn = true;
      parenDepth = 1;
    }
    
    // Track brace and paren depth
    for (const char of line) {
      if (char === '{') braceDepth++;
      if (char === '}') braceDepth--;
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth--;
    }
    
    // Find JSX opening tags and inject data attributes
    line = processLine(line, filePath, lineNumber, () => {
      const count = (elementCounters.get(filePath) || 0) + 1;
      elementCounters.set(filePath, count);
      
      // Create a stable ID based on file path, line, and element count
      const cleanPath = filePath.replace(/^\//, '').replace(/[^a-zA-Z0-9]/g, '_');
      return `${cleanPath}_L${lineNumber}_E${count}`;
    });
    
    result.push(line);
    
    // Reset JSX tracking at end of return
    if (inJSXReturn && parenDepth === 0) {
      inJSXReturn = false;
    }
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
  // Don't process import statements, comments, or type definitions
  if (line.trim().startsWith('import ') || 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') ||
      line.trim().startsWith('*') ||
      line.trim().startsWith('type ') ||
      line.trim().startsWith('interface ') ||
      line.trim().startsWith('export type ') ||
      line.trim().startsWith('export interface ')) {
    return line;
  }

  // Skip lines that are clearly type annotations (const x: Type = ...)
  // Look for patterns like `: React.FC<`, `: FunctionComponent<`, etc.
  if (isTypeAnnotationLine(line)) {
    return line;
  }

  // Match JSX opening tags
  // This regex matches: <tagName or <TagName followed by space, > or attributes
  // But not: < inside a string, </ closing tags, or fragment <>
  const jsxTagRegex = /<([a-zA-Z][a-zA-Z0-9.]*)(?=[\s/>])/g;
  
  let match;
  let result = line;
  
  // Collect all matches first
  const matches: Array<{ index: number; fullMatch: string; tagName: string }> = [];
  
  while ((match = jsxTagRegex.exec(line)) !== null) {
    const fullMatch = match[0];
    const tagName = match[1];
    
    // Skip certain tags and patterns
    if (shouldSkipTag(tagName)) {
      continue;
    }
    
    // Skip if this is inside a TypeScript generic context
    if (isInsideGenericContext(line, match.index)) {
      continue;
    }
    
    // Skip if the character before '<' is alphanumeric (part of a generic like FC<)
    if (match.index > 0) {
      const charBeforeAngle = line[match.index - 1];
      if (/[a-zA-Z0-9_.]/.test(charBeforeAngle)) {
        continue; // This is a generic type parameter, not JSX
      }
    }
    
    // Skip if this appears to be inside a string
    const beforeMatch = line.substring(0, match.index);
    if (isInsideString(beforeMatch)) {
      continue;
    }
    
    // Skip if already has data-lovable-id
    const afterMatch = line.substring(match.index + fullMatch.length);
    if (afterMatch.trimStart().startsWith('data-lovable-id')) {
      continue;
    }
    
    matches.push({
      index: match.index,
      fullMatch,
      tagName,
    });
  }
  
  // Process matches in reverse order to maintain correct indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const { index, fullMatch } = matches[i];
    const elementId = generateId();
    const columnNumber = index + 1;
    
    // Create data attributes
    const dataAttrs = createDataAttributes(filePath, lineNumber, columnNumber, elementId);
    
    // Find where to inject (after tag name, before space/> or first attribute)
    const insertPosition = index + fullMatch.length;
    
    // Check what follows the tag name
    const nextChar = line[insertPosition];
    
    if (nextChar === '>' || nextChar === '/') {
      // Self-closing or immediate close: <div> or <div/>
      result = result.slice(0, insertPosition) + ' ' + dataAttrs + result.slice(insertPosition);
    } else if (nextChar === ' ' || nextChar === '\n' || nextChar === '\t') {
      // Has attributes or whitespace: <div className...
      result = result.slice(0, insertPosition) + ' ' + dataAttrs + result.slice(insertPosition);
    } else {
      // Fallback - insert with space
      result = result.slice(0, insertPosition) + ' ' + dataAttrs + ' ' + result.slice(insertPosition);
    }
  }
  
  return result;
}

/**
 * Check if the line is primarily a type annotation line
 * This catches patterns like: const Component: React.FC<Props> = ...
 */
function isTypeAnnotationLine(line: string): boolean {
  // Match patterns like: `: React.FC<`, `: FC<`, `: FunctionComponent<`, etc.
  const typeAnnotationPatterns = [
    /:\s*(React\.)?FC\s*</,
    /:\s*(React\.)?FunctionComponent\s*</,
    /:\s*(React\.)?VFC\s*</,
    /:\s*(React\.)?ComponentType\s*</,
    /:\s*(React\.)?ComponentProps\s*</,
    /:\s*(React\.)?PropsWithChildren\s*</,
    /:\s*(React\.)?ForwardRefRenderFunction\s*</,
    /:\s*(React\.)?MemoExoticComponent\s*</,
    /:\s*(React\.)?LazyExoticComponent\s*</,
    /:\s*(React\.)?ExoticComponent\s*</,
    // Generic function type with generics
    /:\s*<[A-Z][a-zA-Z0-9]*>/,
  ];
  
  return typeAnnotationPatterns.some(pattern => pattern.test(line));
}

/**
 * Check if the position is inside a TypeScript generic context (between < and >)
 */
function isInsideGenericContext(line: string, position: number): boolean {
  let depth = 0;
  
  for (let i = 0; i < position; i++) {
    const char = line[i];
    const prevChar = i > 0 ? line[i - 1] : '';
    
    // Skip if inside string
    if (isInsideString(line.substring(0, i + 1))) {
      continue;
    }
    
    // Check for generic opening with alphanumeric before it (like FC<, useState<)
    if (char === '<' && /[a-zA-Z0-9_]/.test(prevChar)) {
      depth++;
    } else if (char === '>' && depth > 0) {
      depth--;
    }
  }
  
  return depth > 0;
}

/**
 * Check if position is inside a string
 */
function isInsideString(text: string): boolean {
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateLiteral = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const prevChar = i > 0 ? text[i - 1] : '';
    
    if (char === "'" && prevChar !== '\\' && !inDoubleQuote && !inTemplateLiteral) {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && prevChar !== '\\' && !inSingleQuote && !inTemplateLiteral) {
      inDoubleQuote = !inDoubleQuote;
    } else if (char === '`' && prevChar !== '\\') {
      inTemplateLiteral = !inTemplateLiteral;
    }
  }
  
  return inSingleQuote || inDoubleQuote || inTemplateLiteral;
}

/**
 * Check if a tag should be skipped for source mapping
 */
function shouldSkipTag(tagName: string): boolean {
  // Skip if the name matches common type naming patterns
  if (/Props$/.test(tagName) ||
      /Type$/.test(tagName) ||
      /State$/.test(tagName) ||
      /Config$/.test(tagName) ||
      /Options$/.test(tagName) ||
      /Context$/.test(tagName) ||
      /Interface$/.test(tagName)) {
    return true;
  }

  const skipTags = [
    // React internals
    'React',
    'Fragment',
    'Suspense',
    'StrictMode',
    'Provider',
    'Router',
    'BrowserRouter',
    'HashRouter',
    'MemoryRouter',
    'Route',
    'Routes',
    'Switch',
    'Link',
    'NavLink',
    'Outlet',
    'ErrorBoundary',
    'QueryClientProvider',
    'ThemeProvider',
    'Toaster',
    'TooltipProvider',
    'HelmetProvider',
    'Helmet',
    // React type utilities (commonly used in type annotations)
    'FC',
    'FunctionComponent',
    'VFC',
    'ComponentType',
    'ComponentProps',
    'PropsWithChildren',
    'PropsWithRef',
    'ForwardRefRenderFunction',
    'MemoExoticComponent',
    'LazyExoticComponent',
    'ExoticComponent',
    'RefObject',
    'MutableRefObject',
    'Ref',
    'ForwardedRef',
    'ReactNode',
    'ReactElement',
    'JSX',
    'Element',
    // TypeScript primitive types
    'boolean',
    'string',
    'number',
    'null',
    'undefined',
    'void',
    'never',
    'any',
    'unknown',
    'object',
    'symbol',
    'bigint',
    // Common TypeScript utility types
    'Array',
    'Map',
    'Set',
    'Record',
    'Promise',
    'Partial',
    'Required',
    'Readonly',
    'Pick',
    'Omit',
    'Exclude',
    'Extract',
    'ReturnType',
    'Parameters',
    'NonNullable',
    'Awaited',
    'InstanceType',
    'ConstructorParameters',
    'ThisType',
    'Uppercase',
    'Lowercase',
    'Capitalize',
    'Uncapitalize',
    // Generic type parameters (single letters commonly used)
    'T',
    'K',
    'V',
    'U',
    'P',
    'R',
    'E',
    'S',
    'A',
    'B',
    'C',
    'D',
  ];
  
  return skipTags.includes(tagName);
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

/**
 * Find an element in source code by its source mapping
 */
export function findElementInSource(
  content: string, 
  mapping: SourceMapping
): { line: string; lineNumber: number; startColumn: number; endColumn: number } | null {
  const lines = content.split('\n');
  const lineIndex = mapping.lineNumber - 1;
  
  if (lineIndex < 0 || lineIndex >= lines.length) {
    return null;
  }
  
  const line = lines[lineIndex];
  
  // Try to find the JSX tag at approximately the right column
  const tagMatch = line.match(/<[a-zA-Z][a-zA-Z0-9.]*/);
  if (tagMatch && tagMatch.index !== undefined) {
    return {
      line,
      lineNumber: mapping.lineNumber,
      startColumn: tagMatch.index + 1,
      endColumn: tagMatch.index + tagMatch[0].length,
    };
  }
  
  return {
    line,
    lineNumber: mapping.lineNumber,
    startColumn: mapping.columnNumber,
    endColumn: line.length,
  };
}
