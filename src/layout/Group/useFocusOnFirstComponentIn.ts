import { useEffect, useRef } from 'react';

import type { HRepGroupRow } from 'src/utils/layout/hierarchy.types';

type FocusableHTMLElement = HTMLElement &
  HTMLButtonElement &
  HTMLInputElement &
  HTMLSelectElement &
  HTMLTextAreaElement &
  HTMLAnchorElement;

export function useFocusOnFirstComponentIn<T extends HTMLElement>(
  row: HRepGroupRow | undefined,
  editIndex: number,
  enabled = true,
) {
  const rowItemIds = row?.items.map((i) => i.item.id);
  const ref = useRef<T | null>(null);
  const prevGroupRowItems = useRef<string[] | undefined>(undefined);

  useEffect((): void => {
    if (!ref.current || !enabled || JSON.stringify(prevGroupRowItems.current) === JSON.stringify(rowItemIds)) {
      console.log('No focus', ref.current, enabled, prevGroupRowItems.current, rowItemIds);
      return;
    }
    prevGroupRowItems.current = rowItemIds;

    const firstFocusableChild = findFirstFocusableElement(ref.current);
    console.log('First focusable element', firstFocusableChild);

    if (firstFocusableChild) {
      firstFocusableChild.focus();
    }
    /*
     * Depend on rowItems because generic components are rendered when rowItems change.
     */
  }, [editIndex, rowItemIds, enabled]);

  return ref;
}

function isFocusable(element: FocusableHTMLElement) {
  const tagName = element.tagName.toLowerCase();
  const focusableElements = ['a', 'input', 'select', 'textarea', 'button'];

  if (element.tabIndex < 0) {
    return false;
  }

  const isAvailable =
    element.type !== 'hidden' || !element.disabled || (element.type.toLowerCase() === 'a' && !!element.href);

  return focusableElements.includes(tagName) && isAvailable;
}

function findFirstFocusableElement(container: HTMLElement): FocusableHTMLElement | undefined {
  return Array.from(container.getElementsByTagName('*')).find(isFocusable) as FocusableHTMLElement;
}
