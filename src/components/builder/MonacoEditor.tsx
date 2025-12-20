import { useRef, useCallback } from 'react';
import Editor, { OnMount, OnChange, Monaco } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

type IStandaloneCodeEditor = Parameters<OnMount>[0];

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  readOnly?: boolean;
  path?: string;
}

export function MonacoEditor({
  value,
  language,
  onChange,
  onSave,
  readOnly = false,
  path,
}: MonacoEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Configure TypeScript/JavaScript
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      strict: true,
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.();
    });

    // Configure editor
    editor.updateOptions({
      minimap: { enabled: true, scale: 0.8 },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontLigatures: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      padding: { top: 16 },
      bracketPairColorization: { enabled: true },
      automaticLayout: true,
    });
  }, [onSave]);

  const handleChange: OnChange = useCallback((newValue) => {
    if (newValue !== undefined) {
      onChange(newValue);
    }
  }, [onChange]);

  // Map language names
  const getMonacoLanguage = (lang: string): string => {
    const langMap: Record<string, string> = {
      typescript: 'typescript',
      javascript: 'javascript',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      markdown: 'markdown',
      sql: 'sql',
      yaml: 'yaml',
    };
    return langMap[lang] || 'plaintext';
  };

  return (
    <div className="h-full w-full overflow-hidden bg-[hsl(var(--code-background))]">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={value}
        theme={theme === 'light' ? 'light' : 'vs-dark'}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        path={path}
        options={{
          readOnly,
          domReadOnly: readOnly,
        }}
        loading={
          <div className="h-full w-full flex items-center justify-center bg-background">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      />
    </div>
  );
}
