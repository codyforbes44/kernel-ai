import { useState, useCallback, useEffect, useRef } from 'react';
import type { SelectedElement, VisualChange, VisualEditorMessage } from '@/types/visual-editor';
import type { ProjectFile } from '@/types/builder';
import { applyVisualChangesToSource, generateChangesSummary } from '@/lib/visualEditorPersistence';

interface UseVisualEditorOptions {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onElementSelected?: (element: SelectedElement) => void;
  onElementDeselected?: () => void;
  onChangeApplied?: (change: VisualChange) => void;
  onSaveChanges?: (changes: Array<{ fileId: string; content: string }>) => Promise<void>;
  onDoubleClick?: (element: SelectedElement) => void;
  files?: ProjectFile[];
}

export function useVisualEditor({
  iframeRef,
  onElementSelected,
  onElementDeselected,
  onChangeApplied,
  onSaveChanges,
  onDoubleClick,
  files = [],
}: UseVisualEditorOptions) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<SelectedElement | null>(null);
  const [pendingChanges, setPendingChanges] = useState<VisualChange[]>([]);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  
  // Undo/Redo state
  const [undoStack, setUndoStack] = useState<VisualChange[][]>([]);
  const [redoStack, setRedoStack] = useState<VisualChange[][]>([]);
  
  // Recent colors for color picker
  const [recentColors, setRecentColors] = useState<string[]>([]);
  
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

        case 'VISUAL_EDITOR_ELEMENT_DOUBLE_CLICKED' as any:
          if ((data as any).payload) {
            onDoubleClick?.((data as any).payload);
          }
          break;
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onElementSelected, onElementDeselected, onDoubleClick]);

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
    setIsInlineEditing(false);
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

  // Save state for undo
  const pushToUndoStack = useCallback(() => {
    setUndoStack(prev => [...prev, [...pendingChanges]]);
    setRedoStack([]); // Clear redo on new action
  }, [pendingChanges]);

  // Update style on selected element
  const updateStyle = useCallback((property: string, value: string) => {
    if (!selectedElement) return;

    pushToUndoStack();

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
  }, [selectedElement, sendMessage, onChangeApplied, pushToUndoStack]);

  // Update text on selected element
  const updateText = useCallback((text: string) => {
    if (!selectedElement) return;

    pushToUndoStack();

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
  }, [selectedElement, sendMessage, onChangeApplied, pushToUndoStack]);

  // Update classes on selected element
  const updateClasses = useCallback((classes: string) => {
    if (!selectedElement) return;

    pushToUndoStack();

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
  }, [selectedElement, sendMessage, onChangeApplied, pushToUndoStack]);

  // Undo last change
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const lastState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, [...pendingChanges]]);
    setUndoStack(prev => prev.slice(0, -1));
    setPendingChanges(lastState);
  }, [undoStack, pendingChanges]);

  // Redo last undone change
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, [...pendingChanges]]);
    setRedoStack(prev => prev.slice(0, -1));
    setPendingChanges(nextState);
  }, [redoStack, pendingChanges]);

  // Clear pending changes
  const clearChanges = useCallback(() => {
    setPendingChanges([]);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  // Deselect element
  const deselect = useCallback(() => {
    setSelectedElement(null);
    setIsInlineEditing(false);
    sendMessage({ type: 'VISUAL_EDITOR_DISABLE' });
    setTimeout(() => {
      sendMessage({ type: 'VISUAL_EDITOR_ENABLE' });
    }, 50);
  }, [sendMessage]);

  // Start inline editing
  const startInlineEdit = useCallback(() => {
    if (selectedElement?.textContent) {
      setIsInlineEditing(true);
    }
  }, [selectedElement]);

  // End inline editing
  const endInlineEdit = useCallback(() => {
    setIsInlineEditing(false);
  }, []);

  // Add a color to recent colors
  const addRecentColor = useCallback((color: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== color.toLowerCase());
      return [color, ...filtered].slice(0, 8);
    });
  }, []);

  // Save changes to source files
  const saveChanges = useCallback(async () => {
    if (pendingChanges.length === 0 || !onSaveChanges) return;
    
    setIsSaving(true);
    try {
      // Apply changes to source files
      const results = applyVisualChangesToSource(pendingChanges, files);
      
      if (results.length > 0) {
        // Convert to the format expected by onSaveChanges
        const fileUpdates = results.map(r => ({
          fileId: r.fileId,
          content: r.newContent,
        }));
        
        await onSaveChanges(fileUpdates);
        setPendingChanges([]);
        setUndoStack([]);
        setRedoStack([]);
      }
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges, files, onSaveChanges]);

  // Get changes summary
  const changesSummary = pendingChanges.length > 0 
    ? generateChangesSummary(pendingChanges) 
    : '';

  return {
    isEnabled,
    isReady,
    isSaving,
    selectedElement,
    hoveredElement,
    pendingChanges,
    changesSummary,
    isInlineEditing,
    recentColors,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    enable,
    disable,
    toggle,
    updateStyle,
    updateText,
    updateClasses,
    clearChanges,
    deselect,
    saveChanges,
    undo,
    redo,
    startInlineEdit,
    endInlineEdit,
    addRecentColor,
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
