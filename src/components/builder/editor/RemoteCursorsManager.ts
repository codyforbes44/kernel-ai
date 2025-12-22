import type { Monaco } from '@monaco-editor/react';

// Get editor types from Monaco
type IStandaloneCodeEditor = Parameters<Parameters<Monaco['editor']['create']>[0] extends infer T ? T extends (...args: unknown[]) => infer R ? R : never : never> extends infer E ? E : never;

// Use a more flexible approach for editor types
interface EditorInstance {
  deltaDecorations(oldDecorations: string[], newDecorations: unknown[]): string[];
  addContentWidget(widget: ContentWidgetInstance): void;
  removeContentWidget(widget: ContentWidgetInstance): void;
}

interface ContentWidgetInstance {
  getId(): string;
  getDomNode(): HTMLElement;
  getPosition(): {
    position: { lineNumber: number; column: number };
    preference: number[];
  } | null;
}

export interface SelectionRange {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface RemoteCursor {
  id: string;
  userId: string;
  displayName: string;
  color: string;
  position: { line: number; column: number };
  selection?: SelectionRange;
}

interface CursorWidget extends ContentWidgetInstance {
  userId: string;
}

export class RemoteCursorsManager {
  private editor: EditorInstance;
  private cursorDecorationIds: string[] = [];
  private selectionDecorationIds: string[] = [];
  private widgets: Map<string, CursorWidget> = new Map();
  private styleElement: HTMLStyleElement | null = null;

  constructor(editor: EditorInstance) {
    this.editor = editor;
    this.createStyleElement();
  }

  private createStyleElement(): void {
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'remote-cursors-dynamic-styles';
    document.head.appendChild(this.styleElement);
  }

  private updateDynamicStyles(cursors: RemoteCursor[]): void {
    if (!this.styleElement) return;

    const styles = cursors.map(cursor => {
      const safeId = cursor.userId.replace(/-/g, '');
      // Convert hex to rgba for transparent selection
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      
      return `
        .remote-cursor-${safeId} {
          border-left: 2px solid ${cursor.color} !important;
          margin-left: -1px;
        }
        .remote-cursor-${safeId}::before {
          content: '';
          position: absolute;
          top: 0;
          left: -1px;
          width: 6px;
          height: 6px;
          background-color: ${cursor.color};
          border-radius: 50%;
          transform: translateX(-2px) translateY(-2px);
        }
        .remote-selection-${safeId} {
          background-color: ${hexToRgba(cursor.color, 0.25)} !important;
          border-radius: 2px;
        }
      `;
    }).join('\n');

    this.styleElement.textContent = styles;
  }

  private createLabelElement(displayName: string, color: string): HTMLDivElement {
    const label = document.createElement('div');
    label.className = 'remote-cursor-label';
    label.textContent = displayName;
    label.style.backgroundColor = color;
    label.style.color = this.getContrastColor(color);
    return label;
  }

  private getContrastColor(hexColor: string): string {
    // Convert hex to RGB and determine if white or black text is better
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  updateCursors(cursors: RemoteCursor[]): void {
    // Update dynamic styles for cursor and selection colors
    this.updateDynamicStyles(cursors);

    // Update decorations for cursor lines
    const cursorDecorations = cursors.map(cursor => ({
      range: {
        startLineNumber: cursor.position.line,
        startColumn: cursor.position.column,
        endLineNumber: cursor.position.line,
        endColumn: cursor.position.column,
      },
      options: {
        className: `remote-cursor remote-cursor-${cursor.userId.replace(/-/g, '')}`,
        stickiness: 1, // NeverGrowsWhenTypingAtEdges
        zIndex: 100,
      }
    }));

    this.cursorDecorationIds = this.editor.deltaDecorations(this.cursorDecorationIds, cursorDecorations);

    // Update decorations for selections
    const selectionDecorations = cursors
      .filter(cursor => cursor.selection && this.isValidSelection(cursor.selection))
      .map(cursor => ({
        range: {
          startLineNumber: cursor.selection!.startLine,
          startColumn: cursor.selection!.startColumn,
          endLineNumber: cursor.selection!.endLine,
          endColumn: cursor.selection!.endColumn,
        },
        options: {
          className: `remote-selection remote-selection-${cursor.userId.replace(/-/g, '')}`,
          stickiness: 1,
          zIndex: 50,
        }
      }));

    this.selectionDecorationIds = this.editor.deltaDecorations(this.selectionDecorationIds, selectionDecorations);

    // Update content widgets for name labels
    const currentUserIds = new Set(cursors.map(c => c.userId));

    // Remove widgets for users no longer present
    for (const [userId, widget] of this.widgets) {
      if (!currentUserIds.has(userId)) {
        this.editor.removeContentWidget(widget);
        this.widgets.delete(userId);
      }
    }

    // Add or update widgets for current users
    for (const cursor of cursors) {
      const existingWidget = this.widgets.get(cursor.userId);
      
      if (existingWidget) {
        // Remove and re-add to update position
        this.editor.removeContentWidget(existingWidget);
      }

      const domNode = this.createLabelElement(cursor.displayName, cursor.color);
      
      const widget: CursorWidget = {
        userId: cursor.userId,
        getId: () => `cursor-label-${cursor.userId}`,
        getDomNode: () => domNode,
        getPosition: () => ({
          position: {
            lineNumber: cursor.position.line,
            column: cursor.position.column
          },
          preference: [1, 2] // ABOVE, BELOW
        })
      };

      this.editor.addContentWidget(widget);
      this.widgets.set(cursor.userId, widget);
    }
  }

  // Check if selection is valid (not collapsed)
  private isValidSelection(selection: SelectionRange): boolean {
    return !(
      selection.startLine === selection.endLine && 
      selection.startColumn === selection.endColumn
    );
  }

  dispose(): void {
    // Clear decorations
    this.cursorDecorationIds = this.editor.deltaDecorations(this.cursorDecorationIds, []);
    this.selectionDecorationIds = this.editor.deltaDecorations(this.selectionDecorationIds, []);

    // Remove all widgets
    for (const widget of this.widgets.values()) {
      this.editor.removeContentWidget(widget);
    }
    this.widgets.clear();

    // Remove dynamic styles
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }
}
