import React, { useMemo, useRef } from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';
import { useRegisterNodeNavigationHandler } from 'src/features/form/layout/NavigateToNode';
import { useRepeatingGroup } from 'src/layout/RepeatingGroup/RepeatingGroupContext';
import { useNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';

type FocusableHTMLElement = HTMLElement &
  HTMLButtonElement &
  HTMLInputElement &
  HTMLSelectElement &
  HTMLTextAreaElement &
  HTMLAnchorElement;

export type RefSetter = (rowIndex: number, key: string, node: HTMLElement | null) => void;
export type FocusTrigger = (rowIndex: number) => void;

interface Context {
  refSetter: RefSetter;
  triggerFocus: FocusTrigger;
}

const { Provider, useCtx } = createContext<Context>({
  name: 'RepeatingGroupsFocus',
  required: false,
  default: {
    refSetter: () => undefined,
    triggerFocus: () => undefined,
  },
});

export const useRepeatingGroupsFocusContext = () => useCtx();

export function RepeatingGroupsFocusProvider({ children }: PropsWithChildren) {
  const elementRefs = useMemo(() => new Map<string, HTMLElement | null>(), []);
  const waitingForFocus = useRef<number | null>(null);
  const traversal = useNodeTraversalSelector();

  const { node, openForEditing } = useRepeatingGroup();
  useRegisterNodeNavigationHandler((targetNode) => {
    if (node.item.edit?.mode === 'onlyTable') {
      // It's not possible for us to open rows for editing, so no point in doing anything here.
      return false;
    }
    if (node.item.edit?.mode === 'showAll') {
      // We're already showing all rows, so no point in doing anything here.
      return true;
    }

    let targetChild = targetNode;
    for (const parent of traversal((t) => t.with(targetNode).parents(), [targetNode])) {
      if (node === parent) {
        targetChild = parent;
        continue;
      }

      // We are a parent of the target component, and the targetChild is the target component (or a nested group
      // containing the target component). We should most likely open the row containing targetChild for editing.
      const tableColSetup =
        (node.item.tableColumns && targetChild.getId() && node.item.tableColumns[targetChild.getId()]) || {};

      if (tableColSetup.editInTable || tableColSetup.showInExpandedEdit === false) {
        // No need to open rows or set editIndex for components that are rendered
        // in table (outside the edit container)
        return false;
      }

      for (const row of node.item.rows) {
        if (row.items.find((item) => item.nodeRef === targetChild.getId())) {
          openForEditing(row.uuid);
          return true;
        }
      }
    }

    return false;
  });

  const triggerFocus: FocusTrigger = (rowIndex) => {
    waitingForFocus.current = null;
    if (elementRefs.size === 0) {
      waitingForFocus.current = rowIndex;
      return;
    }

    for (const [key, element] of elementRefs.entries()) {
      if (!key.startsWith(`${rowIndex}-`)) {
        continue;
      }
      const firstFocusableChild = element && findFirstFocusableElement(element);
      if (firstFocusableChild) {
        firstFocusableChild.focus();
        return;
      }
    }

    waitingForFocus.current = rowIndex;
  };

  const refSetter: RefSetter = (rowIndex, key, node) => {
    if (node) {
      elementRefs.set(`${rowIndex}-${key}`, node);

      if (waitingForFocus.current === rowIndex) {
        waitingForFocus.current = null;
        triggerFocus(rowIndex);
      }
    } else {
      elementRefs.delete(`${rowIndex}-${key}`);
    }
  };

  return <Provider value={{ refSetter, triggerFocus }}>{children}</Provider>;
}

function isFocusable(element: FocusableHTMLElement) {
  const tagName = element.tagName.toLowerCase();
  const focusableElements = ['a', 'input', 'select', 'textarea', 'button'];

  if (element.tabIndex < 0) {
    return false;
  }

  const isAvailable =
    (element.tagName === 'INPUT' && element.getAttribute('type') !== 'hidden') ||
    !element.disabled ||
    (element.tagName === 'A' && !!element.href);

  return focusableElements.includes(tagName) && isAvailable;
}

function findFirstFocusableElement(container: HTMLElement): FocusableHTMLElement | undefined {
  return Array.from(container.getElementsByTagName('*')).find(isFocusable) as FocusableHTMLElement;
}
