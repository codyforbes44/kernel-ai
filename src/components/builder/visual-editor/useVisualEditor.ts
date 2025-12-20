import { useState, useCallback, useEffect, useRef } from 'react';
import type { SelectedElement, VisualChange, VisualEditorMessage } from '@/types/visual-editor';

interface UseVisualEditorOptions {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onElementSelected?: (element: SelectedElement) => void;
  onElementDeselected?: () => void;
  onChangeApplied?: (change: VisualChange) => void;
}

export function useVisualEditor({
  iframeRef,
  onElementSelected,
  onElementDeselected,
  onChangeApplied,
}: UseVisualEditorOptions) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<SelectedElement | null>(null);
  const [pendingChanges, setPendingChanges] = useState<VisualChange[]>([]);
  const isEnabledRef = useRef(isEnabled);

  // Keep ref in sync
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  // Handle messages from iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent<VisualEditorMessage>) {
      const data = event.data;
      if (!data || !data.type) return;

      switch (data.type) {
        case 'VISUAL_EDITOR_READY':
          setIsReady(true);
          // If already enabled, re-send enable message
          if (isEnabledRef.current) {
            sendMessage({ type: 'VISUAL_EDITOR_ENABLE' });
          }
          break;

        case 'VISUAL_EDITOR_ELEMENT_HOVERED':
          setHoveredElement(data.payload);
          break;

        case 'VISUAL_EDITOR_ELEMENT_SELECTED':
          setSelectedElement(data.payload);
          onElementSelected?.(data.payload);
          break;

        case 'VISUAL_EDITOR_ELEMENT_DESELECTED':
          setSelectedElement(null);
          onElementDeselected?.();
          break;
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onElementSelected, onElementDeselected]);

  // Send message to iframe
  const sendMessage = useCallback((message: VisualEditorMessage) => {
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(message, '*');
    }
  }, [iframeRef]);

  // Enable visual editing
  const enable = useCallback(() => {
    setIsEnabled(true);
    sendMessage({ type: 'VISUAL_EDITOR_ENABLE' });
  }, [sendMessage]);

  // Disable visual editing
  const disable = useCallback(() => {
    setIsEnabled(false);
    setSelectedElement(null);
    setHoveredElement(null);
    sendMessage({ type: 'VISUAL_EDITOR_DISABLE' });
  }, [sendMessage]);

  // Toggle visual editing
  const toggle = useCallback(() => {
    if (isEnabled) {
      disable();
    } else {
      enable();
    }
  }, [isEnabled, enable, disable]);

  // Update style on selected element
  const updateStyle = useCallback((property: string, value: string) => {
    if (!selectedElement) return;

    const oldValue = selectedElement.styles[property as keyof typeof selectedElement.styles] || '';
    
    sendMessage({
      type: 'VISUAL_EDITOR_UPDATE_STYLE',
      payload: { property, value },
    });

    const change: VisualChange = {
      type: 'style',
      property,
      oldValue,
      newValue: value,
      elementSelector: buildSelector(selectedElement),
      sourceMapping: selectedElement.sourceMapping,
    };

    setPendingChanges(prev => [...prev, change]);
    onChangeApplied?.(change);

    // Update local state
    setSelectedElement(prev => prev ? {
      ...prev,
      styles: { ...prev.styles, [property]: value },
    } : null);
  }, [selectedElement, sendMessage, onChangeApplied]);

  // Update text on selected element
  const updateText = useCallback((text: string) => {
    if (!selectedElement) return;

    const oldValue = selectedElement.textContent;

    sendMessage({
      type: 'VISUAL_EDITOR_UPDATE_TEXT',
      payload: { text },
    });

    const change: VisualChange = {
      type: 'text',
      oldValue,
      newValue: text,
      elementSelector: buildSelector(selectedElement),
      sourceMapping: selectedElement.sourceMapping,
    };

    setPendingChanges(prev => [...prev, change]);
    onChangeApplied?.(change);

    // Update local state
    setSelectedElement(prev => prev ? {
      ...prev,
      textContent: text,
    } : null);
  }, [selectedElement, sendMessage, onChangeApplied]);

  // Update classes on selected element
  const updateClasses = useCallback((classes: string) => {
    if (!selectedElement) return;

    const oldValue = selectedElement.className;

    sendMessage({
      type: 'VISUAL_EDITOR_UPDATE_CLASS',
      payload: { classes },
    });

    const change: VisualChange = {
      type: 'class',
      oldValue,
      newValue: classes,
      elementSelector: buildSelector(selectedElement),
      sourceMapping: selectedElement.sourceMapping,
    };

    setPendingChanges(prev => [...prev, change]);
    onChangeApplied?.(change);

    // Update local state
    setSelectedElement(prev => prev ? {
      ...prev,
      className: classes,
      tailwindClasses: classes.split(/\s+/).filter(c => c.length > 0),
    } : null);
  }, [selectedElement, sendMessage, onChangeApplied]);

  // Clear pending changes
  const clearChanges = useCallback(() => {
    setPendingChanges([]);
  }, []);

  // Deselect element
  const deselect = useCallback(() => {
    setSelectedElement(null);
    sendMessage({ type: 'VISUAL_EDITOR_DISABLE' });
    setTimeout(() => {
      sendMessage({ type: 'VISUAL_EDITOR_ENABLE' });
    }, 50);
  }, [sendMessage]);

  return {
    isEnabled,
    isReady,
    selectedElement,
    hoveredElement,
    pendingChanges,
    enable,
    disable,
    toggle,
    updateStyle,
    updateText,
    updateClasses,
    clearChanges,
    deselect,
  };
}

// Build a CSS selector for the element
function buildSelector(element: SelectedElement): string {
  let selector = element.tagName;
  if (element.id) {
    selector += `#${element.id}`;
  } else if (element.className) {
    const firstClass = element.className.split(' ')[0];
    if (firstClass) {
      selector += `.${firstClass}`;
    }
  }
  return selector;
}
