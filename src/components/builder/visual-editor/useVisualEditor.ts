import { useState, useCallback, useEffect, useRef } from 'react';
import type { SelectedElement, VisualChange, VisualEditorMessage } from '@/types/visual-editor';
import type { ProjectFile } from '@/types/builder';
import { applyVisualChangesToSource, generateChangesSummary, validateChanges } from '@/lib/visualEditorPersistence';
import { formatSourceLocation } from '@/lib/jsxSourceMapper';
import { toast } from 'sonner';

interface UseVisualEditorOptions {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onElementSelected?: (element: SelectedElement) => void;
  onElementDeselected?: () => void;
  onChangeApplied?: (change: VisualChange) => void;
  onSaveChanges?: (changes: Array<{ fileId: string; content: string }>) => Promise<void>;
  onDoubleClick?: (element: SelectedElement) => void;
  onNavigateToSource?: (filePath: string, lineNumber: number) => void;
  files?: ProjectFile[];
}

export function useVisualEditor({
  iframeRef,
  onElementSelected,
  onElementDeselected,
  onChangeApplied,
  onSaveChanges,
  onDoubleClick,
  onNavigateToSource,
  files = [],
}: UseVisualEditorOptions) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<SelectedElement | null>(null);
  const [pendingChanges, setPendingChanges] = useState<VisualChange[]>([]);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  
  // Undo/Redo state with timestamps for history
  const [undoStack, setUndoStack] = useState<{ changes: VisualChange[]; timestamp: Date }[]>([]);
  const [redoStack, setRedoStack] = useState<{ changes: VisualChange[]; timestamp: Date }[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  
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
    setUndoStack(prev => [...prev, { changes: [...pendingChanges], timestamp: new Date() }]);
    setRedoStack([]); // Clear redo on new action
    setCurrentHistoryIndex(prev => prev + 1);
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
    const currentChanges = [...pendingChanges];
    
    // Get the change to revert (last change that was added)
    const changeToRevert = currentChanges[currentChanges.length - 1];
    
    if (changeToRevert && iframeRef.current?.contentWindow) {
      // Send message to iframe to revert this specific change
      iframeRef.current.contentWindow.postMessage({
        type: 'VISUAL_EDITOR_REVERT_CHANGE',
        payload: {
          changeType: changeToRevert.type,
          property: changeToRevert.property,
          value: changeToRevert.oldValue,
          selector: changeToRevert.elementSelector,
        },
      }, '*');
    }
    
    setRedoStack(prev => [...prev, { changes: currentChanges, timestamp: new Date() }]);
    setUndoStack(prev => prev.slice(0, -1));
    setPendingChanges(lastState.changes);
    setCurrentHistoryIndex(prev => prev - 1);
    
    toast.info('Undone');
  }, [undoStack, pendingChanges, iframeRef]);

  // Redo last undone change
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    const currentChanges = [...pendingChanges];
    
    // Get the change to reapply (difference between next state and current)
    if (nextState.changes.length > currentChanges.length) {
      const changeToApply = nextState.changes[nextState.changes.length - 1];
      
      if (changeToApply) {
        // Send message to iframe to apply this specific change
        if (changeToApply.type === 'style' && changeToApply.property) {
          sendMessage({
            type: 'VISUAL_EDITOR_UPDATE_STYLE',
            payload: { property: changeToApply.property, value: changeToApply.newValue },
          });
        } else if (changeToApply.type === 'text') {
          sendMessage({
            type: 'VISUAL_EDITOR_UPDATE_TEXT',
            payload: { text: changeToApply.newValue },
          });
        } else if (changeToApply.type === 'class') {
          sendMessage({
            type: 'VISUAL_EDITOR_UPDATE_CLASS',
            payload: { classes: changeToApply.newValue },
          });
        }
      }
    }
    
    setUndoStack(prev => [...prev, { changes: currentChanges, timestamp: new Date() }]);
    setRedoStack(prev => prev.slice(0, -1));
    setPendingChanges(nextState.changes);
    setCurrentHistoryIndex(prev => prev + 1);
    
    toast.info('Redone');
  }, [redoStack, pendingChanges, sendMessage]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    if (!isEnabled) return;
    
    function handleKeyDown(e: KeyboardEvent) {
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (undoStack.length > 0) {
          // Call undo through ref to avoid stale closure
          const lastState = undoStack[undoStack.length - 1];
          const currentChanges = [...pendingChanges];
          const changeToRevert = currentChanges[currentChanges.length - 1];
          
          if (changeToRevert && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
              type: 'VISUAL_EDITOR_REVERT_CHANGE',
              payload: {
                type: changeToRevert.type,
                property: changeToRevert.property,
                value: changeToRevert.oldValue,
                selector: changeToRevert.elementSelector,
              },
            }, '*');
          }
          
          setRedoStack(prev => [...prev, { changes: currentChanges, timestamp: new Date() }]);
          setUndoStack(prev => prev.slice(0, -1));
          setPendingChanges(lastState.changes);
          setCurrentHistoryIndex(prev => prev - 1);
          toast.info('Undone');
        }
      }
      
      // Redo: Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y or Cmd+Y
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        if (redoStack.length > 0) {
          const nextState = redoStack[redoStack.length - 1];
          const currentChanges = [...pendingChanges];
          
          if (nextState.changes.length > currentChanges.length) {
            const changeToApply = nextState.changes[nextState.changes.length - 1];
            
            if (changeToApply && iframeRef.current?.contentWindow) {
              if (changeToApply.type === 'style' && changeToApply.property) {
                iframeRef.current.contentWindow.postMessage({
                  type: 'VISUAL_EDITOR_UPDATE_STYLE',
                  payload: { property: changeToApply.property, value: changeToApply.newValue },
                }, '*');
              } else if (changeToApply.type === 'text') {
                iframeRef.current.contentWindow.postMessage({
                  type: 'VISUAL_EDITOR_UPDATE_TEXT',
                  payload: { text: changeToApply.newValue },
                }, '*');
              } else if (changeToApply.type === 'class') {
                iframeRef.current.contentWindow.postMessage({
                  type: 'VISUAL_EDITOR_UPDATE_CLASS',
                  payload: { classes: changeToApply.newValue },
                }, '*');
              }
            }
          }
          
          setUndoStack(prev => [...prev, { changes: currentChanges, timestamp: new Date() }]);
          setRedoStack(prev => prev.slice(0, -1));
          setPendingChanges(nextState.changes);
          setCurrentHistoryIndex(prev => prev + 1);
          toast.info('Redone');
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, undoStack, redoStack, pendingChanges, iframeRef]);

  // Clear pending changes
  const clearChanges = useCallback(() => {
    setPendingChanges([]);
    setUndoStack([]);
    setRedoStack([]);
    setCurrentHistoryIndex(-1);
  }, []);

  // Jump to a specific point in history
  const jumpToHistoryPoint = useCallback((targetIndex: number) => {
    // targetIndex: -1 means initial state (no changes)
    // 0+ means that state in the undo stack
    
    if (targetIndex === currentHistoryIndex) return;
    
    // Apply all changes up to targetIndex from the beginning
    const targetChanges = targetIndex >= 0 && targetIndex < undoStack.length 
      ? undoStack[targetIndex].changes 
      : [];
    
    // Clear all visual changes in iframe and reapply
    if (iframeRef.current?.contentWindow) {
      // First, revert all current changes
      for (let i = pendingChanges.length - 1; i >= 0; i--) {
        const change = pendingChanges[i];
        iframeRef.current.contentWindow.postMessage({
          type: 'VISUAL_EDITOR_REVERT_CHANGE',
          payload: {
            type: change.type,
            property: change.property,
            value: change.oldValue,
            selector: change.elementSelector,
          },
        }, '*');
      }
      
      // Then apply changes up to target
      for (const change of targetChanges) {
        if (change.type === 'style' && change.property) {
          iframeRef.current.contentWindow.postMessage({
            type: 'VISUAL_EDITOR_UPDATE_STYLE',
            payload: { property: change.property, value: change.newValue },
          }, '*');
        } else if (change.type === 'text') {
          iframeRef.current.contentWindow.postMessage({
            type: 'VISUAL_EDITOR_UPDATE_TEXT',
            payload: { text: change.newValue },
          }, '*');
        } else if (change.type === 'class') {
          iframeRef.current.contentWindow.postMessage({
            type: 'VISUAL_EDITOR_UPDATE_CLASS',
            payload: { classes: change.newValue },
          }, '*');
        }
      }
    }
    
    setPendingChanges(targetChanges);
    setCurrentHistoryIndex(targetIndex);
    
    toast.info(targetIndex === -1 ? 'Restored to initial state' : `Jumped to step ${targetIndex + 1}`);
  }, [currentHistoryIndex, undoStack, pendingChanges, iframeRef]);

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
    
    // Validate changes first
    const validation = validateChanges(pendingChanges, files);
    if (!validation.valid) {
      console.warn('Some changes may not apply correctly:', validation.errors);
      toast.warning(`Some changes may not persist: ${validation.errors.length} element(s) without source mapping`);
    }
    
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
        toast.success(`Saved ${results.length} file(s) with visual changes`);
        setPendingChanges([]);
        setUndoStack([]);
        setRedoStack([]);
      } else {
        toast.info('No changes could be applied to source files');
      }
    } catch (error) {
      console.error('Failed to save visual changes:', error);
      toast.error('Failed to save changes to source code');
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges, files, onSaveChanges]);

  // Navigate to element source
  const navigateToSource = useCallback(() => {
    if (selectedElement?.sourceMapping && onNavigateToSource) {
      onNavigateToSource(
        selectedElement.sourceMapping.filePath,
        selectedElement.sourceMapping.lineNumber
      );
    }
  }, [selectedElement, onNavigateToSource]);

  // Get source location display string
  const sourceLocation = selectedElement?.sourceMapping 
    ? formatSourceLocation(selectedElement.sourceMapping)
    : null;

  // Get changes summary
  const changesSummary = pendingChanges.length > 0 
    ? generateChangesSummary(pendingChanges) 
    : '';

  // Get the preview for undo (current pending changes that would be reverted)
  const undoPreview = pendingChanges;
  
  // Get the preview for redo (next state that would be restored)
  const redoPreview = redoStack.length > 0 ? redoStack[redoStack.length - 1].changes : [];

  // Build history entries for the timeline panel
  const historyEntries = undoStack.map((entry, index) => ({
    index,
    changes: entry.changes,
    timestamp: entry.timestamp,
  }));

  return {
    isEnabled,
    isReady,
    isSaving,
    selectedElement,
    hoveredElement,
    pendingChanges,
    changesSummary,
    sourceLocation,
    isInlineEditing,
    recentColors,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    undoPreview,
    redoPreview,
    historyEntries,
    currentHistoryIndex,
    enable,
    disable,
    toggle,
    updateStyle,
    updateText,
    updateClasses,
    clearChanges,
    deselect,
    saveChanges,
    navigateToSource,
    undo,
    redo,
    jumpToHistoryPoint,
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
