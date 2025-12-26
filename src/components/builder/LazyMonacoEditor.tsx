import { lazy, Suspense, forwardRef } from 'react';
import type { CollaborativeMonacoEditorRef } from './CollaborativeMonacoEditor';
import type { SelectionRange } from './editor/RemoteCursorsManager';

// Lazy load the heavy Monaco Editor
const CollaborativeMonacoEditor = lazy(() => 
  import('./CollaborativeMonacoEditor').then(m => ({ default: m.CollaborativeMonacoEditor }))
);

interface Collaborator {
  id: string;
  userId: string;
  displayName: string;
  color: string;
  currentFile?: string;
  cursorPosition?: { line: number; column: number };
  selection?: SelectionRange;
}

interface LazyEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  readOnly?: boolean;
  path?: string;
  collaborators: Collaborator[];
  currentFilePath: string;
  onCursorChange?: (position: { line: number; column: number }) => void;
  onSelectionChange?: (selection: SelectionRange | null) => void;
  onTyping?: () => void;
}

// Loading fallback for Monaco Editor
function EditorLoadingFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[hsl(var(--code-background))]">
      <div className="text-center">
        <div className="h-8 w-8 mx-auto mb-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  );
}

// Wrapper component with lazy loading
export const LazyMonacoEditor = forwardRef<CollaborativeMonacoEditorRef, LazyEditorProps>(
  function LazyMonacoEditor(props, ref) {
    return (
      <Suspense fallback={<EditorLoadingFallback />}>
        <CollaborativeMonacoEditor ref={ref} {...props} />
      </Suspense>
    );
  }
);

// Re-export the ref type for consumers
export type { CollaborativeMonacoEditorRef };
