// Script to inject into Sandpack iframe for visual editing capabilities

export function getVisualEditorInjectionScript(): string {
  return `
(function() {
  // Prevent multiple injections
  if (window.__VISUAL_EDITOR_INJECTED__) return;
  window.__VISUAL_EDITOR_INJECTED__ = true;

  let isEnabled = false;
  let selectedElement = null;
  let hoveredElement = null;
  let highlightOverlay = null;
  let selectionOverlay = null;
  let lastClickTime = 0;
  let lastClickElement = null;

  // Create overlay elements
  function createOverlays() {
    highlightOverlay = document.createElement('div');
    highlightOverlay.id = '__visual_editor_highlight__';
    highlightOverlay.style.cssText = \`
      position: fixed;
      pointer-events: none;
      border: 2px dashed hsl(217, 91%, 60%);
      background: hsla(217, 91%, 60%, 0.1);
      z-index: 999998;
      display: none;
      transition: all 0.1s ease;
    \`;
    document.body.appendChild(highlightOverlay);

    selectionOverlay = document.createElement('div');
    selectionOverlay.id = '__visual_editor_selection__';
    selectionOverlay.style.cssText = \`
      position: fixed;
      pointer-events: none;
      border: 2px solid hsl(217, 91%, 60%);
      background: hsla(217, 91%, 60%, 0.15);
      z-index: 999999;
      display: none;
      box-shadow: 0 0 0 4px hsla(217, 91%, 60%, 0.2);
    \`;
    document.body.appendChild(selectionOverlay);
  }

  // Get element info for parent
  function getElementInfo(el) {
    if (!el || el === document.body || el === document.documentElement) return null;

    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    
    // Build parent chain
    const parentChain = [];
    let parent = el.parentElement;
    while (parent && parent !== document.body) {
      parentChain.push(parent.tagName.toLowerCase() + (parent.className ? '.' + parent.className.split(' ')[0] : ''));
      parent = parent.parentElement;
      if (parentChain.length > 5) break;
    }

    return {
      tagName: el.tagName.toLowerCase(),
      className: el.className || '',
      id: el.id || '',
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      },
      textContent: el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE 
        ? el.textContent?.trim() || '' 
        : '',
      innerHTML: el.innerHTML || '',
      styles: {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily,
        fontWeight: styles.fontWeight,
        padding: styles.padding,
        paddingTop: styles.paddingTop,
        paddingRight: styles.paddingRight,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft,
        margin: styles.margin,
        marginTop: styles.marginTop,
        marginRight: styles.marginRight,
        marginBottom: styles.marginBottom,
        marginLeft: styles.marginLeft,
        borderRadius: styles.borderRadius,
        border: styles.border,
        opacity: styles.opacity,
        textAlign: styles.textAlign,
        lineHeight: styles.lineHeight,
        letterSpacing: styles.letterSpacing
      },
      tailwindClasses: (el.className || '').split(/\\s+/).filter(c => c.length > 0),
      parentChain: parentChain,
      sourceMapping: el.dataset?.lovableId ? {
        elementId: el.dataset.lovableId,
        filePath: el.dataset?.lovableFile || '',
        lineNumber: parseInt(el.dataset?.lovableLine || '0', 10),
        columnNumber: parseInt(el.dataset?.lovableCol || '0', 10)
      } : undefined
    };
  }

  // Position overlay on element
  function positionOverlay(overlay, rect) {
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    overlay.style.display = 'block';
  }

  // Should ignore this element
  function shouldIgnoreElement(el) {
    if (!el) return true;
    if (el.id?.startsWith('__visual_editor')) return true;
    if (el === document.body || el === document.documentElement) return true;
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') return true;
    return false;
  }

  // Handle mouse move
  function handleMouseMove(e) {
    if (!isEnabled) return;
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (shouldIgnoreElement(target) || target === selectedElement) {
      if (hoveredElement !== target) {
        hoveredElement = null;
        highlightOverlay.style.display = 'none';
      }
      return;
    }

    hoveredElement = target;
    const rect = target.getBoundingClientRect();
    positionOverlay(highlightOverlay, rect);

    // Send hover info to parent
    window.parent.postMessage({
      type: 'VISUAL_EDITOR_ELEMENT_HOVERED',
      payload: getElementInfo(target)
    }, '*');
  }

  // Handle click
  function handleClick(e) {
    if (!isEnabled) return;
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (shouldIgnoreElement(target)) return;

    e.preventDefault();
    e.stopPropagation();

    const now = Date.now();
    const isDoubleClick = (now - lastClickTime < 300) && (lastClickElement === target);
    lastClickTime = now;
    lastClickElement = target;

    // Handle double-click for inline text editing
    if (isDoubleClick && target.childNodes.length === 1 && target.childNodes[0].nodeType === Node.TEXT_NODE) {
      window.parent.postMessage({
        type: 'VISUAL_EDITOR_ELEMENT_DOUBLE_CLICKED',
        payload: getElementInfo(target)
      }, '*');
      return;
    }

    // Deselect if clicking same element
    if (selectedElement === target) {
      selectedElement = null;
      selectionOverlay.style.display = 'none';
      window.parent.postMessage({ type: 'VISUAL_EDITOR_ELEMENT_DESELECTED' }, '*');
      return;
    }

    selectedElement = target;
    const rect = target.getBoundingClientRect();
    positionOverlay(selectionOverlay, rect);
    highlightOverlay.style.display = 'none';

    // Send selection info to parent
    window.parent.postMessage({
      type: 'VISUAL_EDITOR_ELEMENT_SELECTED',
      payload: getElementInfo(target)
    }, '*');
  }

  // Handle messages from parent
  function handleMessage(e) {
    const { type, payload } = e.data || {};

    switch (type) {
      case 'VISUAL_EDITOR_ENABLE':
        isEnabled = true;
        document.body.style.cursor = 'crosshair';
        break;

      case 'VISUAL_EDITOR_DISABLE':
        isEnabled = false;
        selectedElement = null;
        hoveredElement = null;
        document.body.style.cursor = '';
        highlightOverlay.style.display = 'none';
        selectionOverlay.style.display = 'none';
        break;

      case 'VISUAL_EDITOR_UPDATE_STYLE':
        if (selectedElement && payload) {
          selectedElement.style[payload.property] = payload.value;
          // Update selection overlay position in case size changed
          const rect = selectedElement.getBoundingClientRect();
          positionOverlay(selectionOverlay, rect);
        }
        break;

      case 'VISUAL_EDITOR_UPDATE_TEXT':
        if (selectedElement && payload && selectedElement.childNodes.length === 1 
            && selectedElement.childNodes[0].nodeType === Node.TEXT_NODE) {
          selectedElement.textContent = payload.text;
          // Update selection overlay
          const rect = selectedElement.getBoundingClientRect();
          positionOverlay(selectionOverlay, rect);
        }
        break;

      case 'VISUAL_EDITOR_UPDATE_CLASS':
        if (selectedElement && payload) {
          selectedElement.className = payload.classes;
        }
        break;

      case 'VISUAL_EDITOR_DUPLICATE':
        if (selectedElement && selectedElement.parentElement) {
          const clone = selectedElement.cloneNode(true);
          selectedElement.parentElement.insertBefore(clone, selectedElement.nextSibling);
          // Select the cloned element
          selectedElement = clone;
          const rect = clone.getBoundingClientRect();
          positionOverlay(selectionOverlay, rect);
          window.parent.postMessage({
            type: 'VISUAL_EDITOR_ELEMENT_SELECTED',
            payload: getElementInfo(clone)
          }, '*');
        }
        break;

      case 'VISUAL_EDITOR_DELETE':
        if (selectedElement && selectedElement.parentElement) {
          selectedElement.parentElement.removeChild(selectedElement);
          selectedElement = null;
          selectionOverlay.style.display = 'none';
          window.parent.postMessage({ type: 'VISUAL_EDITOR_ELEMENT_DESELECTED' }, '*');
        }
        break;
    }
  }

  // Update selection overlay on scroll/resize
  function updateSelectionPosition() {
    if (selectedElement && selectionOverlay.style.display !== 'none') {
      const rect = selectedElement.getBoundingClientRect();
      positionOverlay(selectionOverlay, rect);
    }
  }

  // Handle ESC key to deselect/disable
  function handleKeyDown(e) {
    if (e.key === 'Escape' && isEnabled) {
      if (selectedElement) {
        selectedElement = null;
        selectionOverlay.style.display = 'none';
        window.parent.postMessage({ type: 'VISUAL_EDITOR_ELEMENT_DESELECTED' }, '*');
      }
    }
  }

  // Initialize
  function init() {
    createOverlays();
    
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('message', handleMessage);
    window.addEventListener('scroll', updateSelectionPosition, { passive: true });
    window.addEventListener('resize', updateSelectionPosition, { passive: true });

    // Notify parent we're ready
    window.parent.postMessage({ type: 'VISUAL_EDITOR_READY' }, '*');
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;
}
