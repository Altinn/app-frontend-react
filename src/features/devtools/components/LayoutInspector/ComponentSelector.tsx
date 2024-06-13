import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@digdir/designsystemet-react';
import { HandFingerFillIcon } from '@navikt/aksel-icons';

import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { setHighlightStyle } from 'src/features/devtools/hooks/useComponentHighlighter';

type ComponentSelectorProps = {
  type: 'component' | 'node';
};

export function ComponentSelector({ type }: ComponentSelectorProps) {
  const [active, setActive] = useState(false);
  const selectNode = useDevToolsStore((state) => state.actions.focusNodeInspector);
  const selectComponent = useDevToolsStore((state) => state.actions.focusLayoutInspector);

  const selected = useRef<string | null>(null);
  const listenersRef = useRef<{ eventType: string; listener: EventListener }[]>([]);

  const highlightElementsRef = useRef(new Map<Element, Element>());

  function toggle() {
    if (!active) {
      activate();
    } else {
      deactivate();
    }
  }

  function activate() {
    cleanup();

    const moveListener = function (event: MouseEvent) {
      let newElement: Element | null = null;
      let newId: string | null = null;

      const hoverElements = document.elementsFromPoint(event.clientX, event.clientY);
      for (const element of hoverElements) {
        const id = element.getAttribute(type === 'node' ? 'data-componentid' : 'data-componentbaseid');
        if (id) {
          newElement = element;
          newId = id;
          break;
        }
      }

      selected.current = newId;

      if (newElement && !highlightElementsRef.current.has(newElement)) {
        const highlightElement = document.createElement('div');
        setHighlightStyle(highlightElement, newElement as HTMLElement);
        document.body.appendChild(highlightElement);
        highlightElementsRef.current.set(newElement, highlightElement);
      }

      for (const [element, highlightElement] of highlightElementsRef.current.entries()) {
        if (element !== newElement) {
          highlightElement.remove();
          highlightElementsRef.current.delete(element);
        }
      }
    };

    const clickListener = function () {
      if (selected.current) {
        if (type === 'node') {
          selectNode(selected.current);
        } else {
          selectComponent(selected.current);
        }
        deactivate();
      }
    };

    const escapeListener = function (event: KeyboardEvent) {
      if (event.key === 'Escape') {
        deactivate();
      }
    };

    listenersRef.current.push({ eventType: 'mousemove', listener: moveListener });
    listenersRef.current.push({ eventType: 'click', listener: clickListener });
    listenersRef.current.push({ eventType: 'keydown', listener: escapeListener });

    for (const { eventType, listener } of listenersRef.current) {
      window.addEventListener(eventType, listener);
    }
    setActive(true);
  }

  function deactivate() {
    cleanup();
    setActive(false);
  }

  const cleanup = useCallback(() => {
    for (const { eventType, listener } of listenersRef.current) {
      window.removeEventListener(eventType, listener);
    }
    listenersRef.current = [];

    for (const highlightElement of highlightElementsRef.current.values()) {
      highlightElement.remove();
    }
    highlightElementsRef.current = new Map();

    selected.current = null;
  }, []);

  // Clean up event listener on unmount
  useEffect(() => cleanup, [cleanup]);

  return (
    <div style={{ position: 'relative' }}>
      <Button
        size='sm'
        onClick={toggle}
        variant={active ? 'secondary' : 'primary'}
        color='second'
        style={{ position: 'absolute', zIndex: 10, right: 0, top: 0 }}
      >
        <HandFingerFillIcon aria-hidden />
      </Button>
    </div>
  );
}
