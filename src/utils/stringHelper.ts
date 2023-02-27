import { isValidElement } from 'react';

export const capitalizeName = (name: string) => {
  return name
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
};

export const getLabelFromChildren = (children: React.ReactNode): string => {
  const hasChildren = (element: React.ReactNode) => isValidElement(element) && Boolean(element.props.children);

  const reactChildrenText = (children) => {
    if (hasChildren(children)) return reactChildrenText(children.props.children);
    return children;
  };

  return reactChildrenText(children);
};
