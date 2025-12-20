import { useEffect, useCallback, useRef } from 'react';

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

// Use a WeakMap to store shortcuts per component instance
const shortcutRegistry = new Map<string, ShortcutConfig>();
let shortcutIdCounter = 0;

export function useKeyboardShortcuts() {
  const registeredIdsRef = useRef<Set<string>>(new Set());

  const registerShortcut = useCallback((config: ShortcutConfig) => {
    const id = `shortcut-${++shortcutIdCounter}`;
    shortcutRegistry.set(id, config);
    registeredIdsRef.current.add(id);

    return () => {
      shortcutRegistry.delete(id);
      registeredIdsRef.current.delete(id);
    };
  }, []);

  // Cleanup all shortcuts registered by this hook instance on unmount
  useEffect(() => {
    return () => {
      registeredIdsRef.current.forEach(id => {
        shortcutRegistry.delete(id);
      });
      registeredIdsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable;

      for (const [, shortcut] of shortcutRegistry) {
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

  // Return shortcuts as an array for external use
  const shortcuts = Array.from(shortcutRegistry.values());

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
