import { useEffect, useCallback } from 'react';

type ShortcutCallback = () => void;

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: ShortcutCallback;
  description: string;
}

const shortcuts: ShortcutConfig[] = [];

export function useKeyboardShortcuts() {
  const registerShortcut = useCallback((config: ShortcutConfig) => {
    const existingIndex = shortcuts.findIndex(
      s => s.key === config.key && 
           s.ctrl === config.ctrl && 
           s.meta === config.meta && 
           s.shift === config.shift &&
           s.alt === config.alt
    );
    
    if (existingIndex >= 0) {
      shortcuts[existingIndex] = config;
    } else {
      shortcuts.push(config);
    }

    return () => {
      const index = shortcuts.indexOf(config);
      if (index >= 0) shortcuts.splice(index, 1);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable;

      for (const shortcut of shortcuts) {
        const modifierMatch = 
          (shortcut.ctrl ? e.ctrlKey : !e.ctrlKey || shortcut.meta) &&
          (shortcut.meta ? e.metaKey : !e.metaKey || shortcut.ctrl) &&
          (shortcut.shift ? e.shiftKey : !e.shiftKey) &&
          (shortcut.alt ? e.altKey : !e.altKey);

        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        // For Cmd/Ctrl shortcuts, allow even in input fields
        const requiresModifier = shortcut.ctrl || shortcut.meta;

        if (keyMatch && modifierMatch && (requiresModifier || !isInputField)) {
          e.preventDefault();
          shortcut.callback();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { registerShortcut, shortcuts };
}

// Hook for individual shortcuts
export function useShortcut(
  key: string,
  callback: ShortcutCallback,
  options: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean; description?: string } = {}
) {
  const { registerShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    const unregister = registerShortcut({
      key,
      ctrl: options.ctrl,
      meta: options.meta,
      shift: options.shift,
      alt: options.alt,
      callback,
      description: options.description || '',
    });

    return unregister;
  }, [key, callback, options.ctrl, options.meta, options.shift, options.alt, options.description, registerShortcut]);
}
