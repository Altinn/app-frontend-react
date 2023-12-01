import { Children, isValidElement } from 'react';
import type { ReactNode } from 'react';

import { Lang } from 'src/features/language/Lang';

export const capitalizeName = (name: string) =>
  name
    .toLowerCase()
    .split(' ')
    .map((word) => word.trim())
    .filter((word) => !!word)
    .map((word) => {
      const firstLetter = word[0];
      const rest = word.substring(1);

      if (firstLetter && rest) {
        return firstLetter.toUpperCase() + rest;
      }

      return word;
    })
    .join(' ')
    .trim();

export const getPlainTextFromNode = (node: ReactNode): string => {
  if (typeof node === 'string') {
    return node;
  }
  if (isValidElement(node)) {
    if (node.type === Lang) {
      // TODO: We can probably do something better here, and call the langAsString function on the properties
      // instead, like the Lang component does
      throw new Error('Lang component cannot be cast to string, use langAsString instead');
    }

    let text = '';
    Children.forEach(node.props.children, (child) => {
      text += getPlainTextFromNode(child);
    });
    return text;
  }
  return '';
};

export function duplicateStringFilter(currentString: string, currentIndex: number, strings: string[]): boolean {
  for (let i = 0; i < currentIndex; i++) {
    if (currentString === strings[i]) {
      return false;
    }
  }
  return true;
}
