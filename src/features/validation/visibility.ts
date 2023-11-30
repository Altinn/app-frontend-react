import type { ValidationUrgency } from '.';

import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { CompGroupRepeatingInternal } from 'src/layout/Group/config.generated';
import type { LayoutNodeForGroup } from 'src/layout/Group/LayoutNodeForGroup';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export type Visibility = {
  urgency: ValidationUrgency;
  children: {
    [key: string]: Visibility | undefined;
  };
  items: (Visibility | undefined)[];
};

type PathItem = string | number;

/**
 * Gets a nodes path from the root visibility
 */
function getPathFromRoot(node: LayoutNode | LayoutPage): PathItem[] {
  const path: PathItem[] = [];
  let currentNode: LayoutNode | LayoutPage = node;
  while (typeof currentNode !== 'undefined') {
    if (currentNode instanceof BaseLayoutNode) {
      const key = currentNode.item.baseComponentId ?? currentNode.item.id;
      path.push(key);

      if (typeof currentNode.rowIndex !== 'undefined') {
        path.push(currentNode.rowIndex);
      }
    }

    if (currentNode instanceof LayoutPage) {
      path.push(currentNode.top.myKey);
    }

    currentNode = currentNode.parent;
  }

  return path.reverse();
}

function getChildVisibility(visibility: Visibility, key: PathItem): Visibility | undefined {
  if (typeof key === 'number') {
    return visibility.items[key];
  } else {
    return visibility.children[key];
  }
}

function setChildVisibility(visibility: Visibility, key: PathItem, child: Visibility | undefined): void {
  if (typeof key === 'number') {
    visibility.items[key] = child;
  } else {
    visibility.children[key] = child;
  }
}

function deleteChildVisibility(visibility: Visibility, key: PathItem): void {
  if (typeof key === 'number') {
    delete visibility.items[key];
  } else {
    delete visibility.children[key];
  }
}

export function addVisibilityForNode(node: LayoutNode, state: Visibility): void {
  const path = getPathFromRoot(node);

  let currentVisibility: Visibility = state;
  for (const key of path) {
    if (!getChildVisibility(currentVisibility, key)) {
      setChildVisibility(currentVisibility, key, {
        urgency: 0,
        children: {},
        items: [],
      });
    }
    currentVisibility = getChildVisibility(currentVisibility, key)!;
  }
}

export function removeVisibilityForNode(node: LayoutNode, state: Visibility): void {
  const path = getPathFromRoot(node);
  const pathToParent = path.slice(0, -1);
  const key = path.at(-1)!;

  // The parent of a node will always be an object
  const parentVisibility = getVisibilityFromPath(pathToParent, state);
  if (parentVisibility) {
    deleteChildVisibility(parentVisibility, key);

    // If all children are removed from a list row, remove the list row visibility
    const parentKey = pathToParent.at(-1);
    // If the parentkey is a number, then the parent will only have children (not items), since rows are never directly nested. It must go through a nested group child.
    if (typeof parentKey === 'number' && Object.keys(parentVisibility.children).length === 0) {
      const grandParentVisibility = getVisibilityFromPath(pathToParent.slice(0, -1), state);
      if (grandParentVisibility) {
        deleteChildVisibility(grandParentVisibility, parentKey);
      }
    }
  }
}

export function onBeforeRowDelete(
  groupNode: LayoutNodeForGroup<CompGroupRepeatingInternal>,
  rowIndex: number,
  state: Visibility,
) {
  const path = getPathFromRoot(groupNode);
  const groupVisibility = getVisibilityFromPath(path, state);
  groupVisibility?.items.splice(rowIndex, 1);
}

function getVisibilityFromPath(path: PathItem[], state: Visibility): Visibility | undefined {
  let currentVisibility: Visibility = state;
  for (const key of path) {
    const nextVisibility = getChildVisibility(currentVisibility, key);

    if (!nextVisibility) {
      return undefined;
    }
    currentVisibility = nextVisibility;
  }
  return currentVisibility;
}

export function getRawVisibilityForNode(
  node: LayoutNode | LayoutPage,
  state: Visibility,
  rowIndex?: number,
): number | undefined {
  const path = getPathFromRoot(node);
  if (typeof rowIndex !== 'undefined') {
    path.push(rowIndex);
  }
  const visibility = getVisibilityFromPath(path, state);
  return visibility?.urgency;
}

export function getResolvedVisibilityForNode(node: LayoutNode, state: Visibility): number {
  let urgency = state.urgency;

  const path = getPathFromRoot(node);

  let currentVisibility: Visibility = state;
  for (const key of path) {
    const nextVisibility = getChildVisibility(currentVisibility, key);

    if (!nextVisibility) {
      break;
    }

    urgency = Math.max(urgency, nextVisibility.urgency);

    currentVisibility = nextVisibility;
  }
  return urgency;
}

export function setVisibilityForNode(
  node: LayoutNode | LayoutPage,
  state: Visibility,
  urgency: number,
  rowIndex?: number,
): void {
  const path = getPathFromRoot(node);
  if (typeof rowIndex !== 'undefined') {
    path.push(rowIndex);
  }
  const visibility = getVisibilityFromPath(path, state);

  if (!visibility) {
    const keys = path.join(' -> ');
    window.logWarnOnce(`Could not find visibility for ${keys}`);
    return;
  }

  visibility.urgency = urgency;
}
