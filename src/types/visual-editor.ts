// Visual Editor Types

export interface SelectedElement {
  // DOM reference data
  tagName: string;
  className: string;
  id: string;
  
  // Position & size
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  
  // Content
  textContent: string;
  innerHTML: string;
  
  // Styles (computed)
  styles: {
    color: string;
    backgroundColor: string;
    fontSize: string;
    fontFamily: string;
    fontWeight: string;
    padding: string;
    margin: string;
    borderRadius: string;
    border: string;
    opacity: string;
    textAlign: string;
    lineHeight: string;
    letterSpacing: string;
  };
  
  // Source mapping
  sourceMapping?: {
    filePath: string;
    lineNumber: number;
    columnNumber: number;
    elementId: string;
  };
  
  // Tailwind classes (if any)
  tailwindClasses: string[];
  
  // Parent chain for context
  parentChain: string[];
}

export interface VisualChange {
  type: 'text' | 'style' | 'class' | 'attribute';
  property?: string;
  oldValue: string;
  newValue: string;
  elementSelector: string;
  sourceMapping?: SelectedElement['sourceMapping'];
}

export interface VisualEditorState {
  isEnabled: boolean;
  isSelecting: boolean;
  selectedElement: SelectedElement | null;
  hoveredElement: SelectedElement | null;
  pendingChanges: VisualChange[];
}

// Messages between iframe and parent
export type VisualEditorMessage = 
  | { type: 'VISUAL_EDITOR_READY' }
  | { type: 'VISUAL_EDITOR_ELEMENT_HOVERED'; payload: SelectedElement | null }
  | { type: 'VISUAL_EDITOR_ELEMENT_SELECTED'; payload: SelectedElement }
  | { type: 'VISUAL_EDITOR_ELEMENT_DESELECTED' }
  | { type: 'VISUAL_EDITOR_ENABLE' }
  | { type: 'VISUAL_EDITOR_DISABLE' }
  | { type: 'VISUAL_EDITOR_UPDATE_STYLE'; payload: { property: string; value: string } }
  | { type: 'VISUAL_EDITOR_UPDATE_TEXT'; payload: { text: string } }
  | { type: 'VISUAL_EDITOR_UPDATE_CLASS'; payload: { classes: string } };

// Tailwind class categories for the editor
export const TAILWIND_SPACING = [
  '0', 'px', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '16', '20', '24', '28', '32', '36', '40', '44', '48', '52', '56', '60', '64', '72', '80', '96'
];

export const TAILWIND_COLORS = [
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
];

export const TAILWIND_SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

export const TAILWIND_FONT_SIZES = [
  'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'
];

export const TAILWIND_FONT_WEIGHTS = [
  'thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'
];

export const TAILWIND_BORDER_RADIUS = [
  'none', 'sm', '', 'md', 'lg', 'xl', '2xl', '3xl', 'full'
];

// Helper to extract Tailwind classes from className
export function extractTailwindClasses(className: string): string[] {
  if (!className) return [];
  return className.split(/\s+/).filter(c => c.length > 0);
}

// Helper to parse Tailwind class into parts
export function parseTailwindClass(cls: string): { prefix?: string; property: string; value?: string } {
  // Handle responsive/state prefixes like sm:, hover:, dark:
  const prefixMatch = cls.match(/^((?:[a-z]+:)+)?(.+)$/);
  const prefix = prefixMatch?.[1];
  const rest = prefixMatch?.[2] || cls;
  
  // Parse property-value like text-red-500, p-4, etc.
  const parts = rest.split('-');
  if (parts.length === 1) {
    return { prefix, property: parts[0] };
  }
  
  return {
    prefix,
    property: parts[0],
    value: parts.slice(1).join('-'),
  };
}
