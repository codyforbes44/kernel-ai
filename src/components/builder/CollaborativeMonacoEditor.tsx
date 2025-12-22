import React, { useRef, useEffect, useCallback } from 'react';
import { MonacoEditor, IStandaloneCodeEditor, MonacoInstance } from './MonacoEditor';
import { RemoteCursorsManager, RemoteCursor } from './editor/RemoteCursorsManager';

interface Collaborator {
  id: string;
  userId: string;
  displayName: string;
  color: string;
  currentFile?: string;
  cursorPosition?: { line: number; column: number };
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
}

export function CollaborativeMonacoEditor({
  value,
  language,
  onChange,
  onSave,
  readOnly,
  path,
  collaborators,
  currentFilePath,
  onCursorChange,
}: CollaborativeMonacoEditorProps) {
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  const cursorsManagerRef = useRef<RemoteCursorsManager | null>(null);
  const cursorListenerRef = useRef<{ dispose: () => void } | null>(null);

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
  }, [onCursorChange]);

  // Update remote cursors when collaborators change
  useEffect(() => {
    if (!cursorsManagerRef.current) return;

    const remoteCursors: RemoteCursor[] = relevantCollaborators.map(c => ({
      id: c.id,
      userId: c.userId,
      displayName: c.displayName,
      color: c.color,
      position: c.cursorPosition!,
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
}
