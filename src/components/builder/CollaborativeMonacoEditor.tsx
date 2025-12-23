import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { MonacoEditor, IStandaloneCodeEditor, MonacoInstance } from './MonacoEditor';
import { RemoteCursorsManager, RemoteCursor, SelectionRange } from './editor/RemoteCursorsManager';

interface Collaborator {
  id: string;
  userId: string;
  displayName: string;
  color: string;
  currentFile?: string;
  cursorPosition?: { line: number; column: number };
  selection?: SelectionRange;
}

interface CollaborativeMonacoEditorProps {
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

export interface CollaborativeMonacoEditorRef {
  insertCode: (code: string) => void;
}

export const CollaborativeMonacoEditor = forwardRef<CollaborativeMonacoEditorRef, CollaborativeMonacoEditorProps>(function CollaborativeMonacoEditor({
  value,
  language,
  onChange,
  onSave,
  readOnly,
  path,
  collaborators,
  currentFilePath,
  onCursorChange,
  onSelectionChange,
  onTyping,
}, ref) {
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  const cursorsManagerRef = useRef<RemoteCursorsManager | null>(null);
  const cursorListenerRef = useRef<{ dispose: () => void } | null>(null);
  const selectionListenerRef = useRef<{ dispose: () => void } | null>(null);
  const contentListenerRef = useRef<{ dispose: () => void } | null>(null);

  // Filter collaborators editing the same file with valid cursor positions
  const relevantCollaborators = collaborators.filter(
    c => c.currentFile === currentFilePath && c.cursorPosition
  );

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor: IStandaloneCodeEditor, monaco: MonacoInstance) => {
    editorRef.current = editor;
    
    // Initialize remote cursors manager
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cursorsManagerRef.current = new RemoteCursorsManager(editor as any);

    // Add cursor position listener
    cursorListenerRef.current = editor.onDidChangeCursorPosition((e: { position: { lineNumber: number; column: number } }) => {
      if (onCursorChange) {
        onCursorChange({
          line: e.position.lineNumber,
          column: e.position.column,
        });
      }
    });

    // Add selection change listener
    selectionListenerRef.current = editor.onDidChangeCursorSelection((e: { 
      selection: { 
        startLineNumber: number; 
        startColumn: number; 
        endLineNumber: number; 
        endColumn: number;
      } 
    }) => {
      if (onSelectionChange) {
        const sel = e.selection;
        // Only track non-collapsed selections
        if (sel.startLineNumber !== sel.endLineNumber || sel.startColumn !== sel.endColumn) {
          onSelectionChange({
            startLine: sel.startLineNumber,
            startColumn: sel.startColumn,
            endLine: sel.endLineNumber,
            endColumn: sel.endColumn,
          });
        } else {
          onSelectionChange(null);
        }
      }
    });

    // Add content change listener for typing detection
    contentListenerRef.current = editor.onDidChangeModelContent(() => {
      if (onTyping) {
        onTyping();
      }
    });
  }, [onCursorChange, onSelectionChange, onTyping]);

  // Expose insertCode method via ref
  useImperativeHandle(ref, () => ({
    insertCode: (code: string) => {
      const editor = editorRef.current;
      if (!editor) return;
      
      const position = editor.getPosition();
      if (!position) return;
      
      const model = editor.getModel();
      if (!model) return;
      
      // Insert code at current cursor position
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      };
      
      // Execute the edit
      editor.executeEdits('insertCode', [{ range, text: code }]);
      
      // Focus the editor after inserting
      editor.focus();
    },
  }), []);

  // Update remote cursors when collaborators change
  useEffect(() => {
    if (!cursorsManagerRef.current) return;

    const remoteCursors: RemoteCursor[] = relevantCollaborators.map(c => ({
      id: c.id,
      userId: c.userId,
      displayName: c.displayName,
      color: c.color,
      position: c.cursorPosition!,
      selection: c.selection,
    }));

    cursorsManagerRef.current.updateCursors(remoteCursors);
  }, [relevantCollaborators]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cursorListenerRef.current) {
        cursorListenerRef.current.dispose();
        cursorListenerRef.current = null;
      }
      if (selectionListenerRef.current) {
        selectionListenerRef.current.dispose();
        selectionListenerRef.current = null;
      }
      if (contentListenerRef.current) {
        contentListenerRef.current.dispose();
        contentListenerRef.current = null;
      }
      if (cursorsManagerRef.current) {
        cursorsManagerRef.current.dispose();
        cursorsManagerRef.current = null;
      }
    };
  }, []);

  return (
    <MonacoEditor
      value={value}
      language={language}
      onChange={onChange}
      onSave={onSave}
      readOnly={readOnly}
      path={path}
      onMount={handleEditorDidMount}
    />
  );
});
