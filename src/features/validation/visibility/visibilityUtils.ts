import { getInitialMaskFromNode } from 'src/features/validation/utils';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { ValidationVisibilitySelector } from 'src/features/validation/validationContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export type Visibility = {
  mask: number;
  children: {
    [key: string]: Visibility | undefined;
  };
};

/**
 * Gets a nodes path from the root visibility
 */
function getPathFromRoot(node: LayoutNode | LayoutPage): string[] {
  const path: string[] = [];
  let currentNode: LayoutNode | LayoutPage = node;
  while (typeof currentNode !== 'undefined') {
    if (currentNode instanceof BaseLayoutNode) {
      path.push(currentNode.getBaseId());

      if (typeof currentNode.row?.uuid !== 'undefined') {
        path.push(makeRowKey(currentNode.row.uuid));
      }
    }

    if (currentNode instanceof LayoutPage) {
      path.push(currentNode.pageKey);
    }

    currentNode = currentNode.parent;
  }

  return path.reverse();
}

function makeRowKey(rowId: string): string {
  return `row=${rowId}`;
}

function isRowKey(key: string | undefined): key is string {
  return key === undefined ? false : key.startsWith('row=');
}

function getChildVisibility(visibility: Visibility, key: string): Visibility | undefined {
  return visibility.children[key];
}

function setChildVisibility(visibility: Visibility, key: string, child: Visibility | undefined): void {
  visibility.children[key] = child;
}

function deleteChildVisibility(visibility: Visibility, key: string): void {
  delete visibility.children[key];
}

export function addVisibilityForNode(node: LayoutNode, state: Visibility): void {
  const path = getPathFromRoot(node);
  const initialMask = getInitialMaskFromNode(node);

  // Make sure each node in the path is defined, if not initialize to zero
  // It should get set to its proper initial value once it is explicitly set
  let currentVisibility: Visibility = state;
  for (const key of path.slice(0, -1)) {
    if (!getChildVisibility(currentVisibility, key)) {
      setChildVisibility(currentVisibility, key, {
        mask: 0,
        children: {},
      });
    }
    currentVisibility = getChildVisibility(currentVisibility, key)!;
  }

  // Set the visibility for the node to its initial mask
  const key = path.at(-1)!;
  const nodeVisibility = getChildVisibility(currentVisibility, key);
  if (!nodeVisibility) {
    setChildVisibility(currentVisibility, key, {
      mask: initialMask,
      children: {},
    });
  } else {
    nodeVisibility.mask = initialMask;
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
    if (isRowKey(parentKey)) {
      const grandParentVisibility = getVisibilityFromPath(pathToParent.slice(0, -1), state);
      if (grandParentVisibility) {
        deleteChildVisibility(grandParentVisibility, parentKey);
      }
    }
  }
}

export function addVisibilityForAttachment(attachmentId: string, node: LayoutNode, state: Visibility): void {
  const path = getPathFromRoot(node);
  let nodeVisibility = getVisibilityFromPath(path, state);
  if (!nodeVisibility) {
    addVisibilityForNode(node, state);
    nodeVisibility = getVisibilityFromPath(path, state)!;
  }
  nodeVisibility.children[attachmentId] = {
    mask: 0,
    children: {},
  };
}

export function removeVisibilityForAttachment(attachmentId: string, node: LayoutNode, state: Visibility): void {
  const path = getPathFromRoot(node);
  const nodeVisibility = getVisibilityFromPath(path, state);
  if (!nodeVisibility) {
    return;
  }
  deleteChildVisibility(nodeVisibility, attachmentId);
}

export function onBeforeRowDelete(groupNode: LayoutNode<'RepeatingGroup'>, rowId: string, state: Visibility) {
  const path = getPathFromRoot(groupNode);
  const groupVisibility = getVisibilityFromPath(path, state);
  if (groupVisibility) {
    delete groupVisibility.children[makeRowKey(rowId)];
  }
}

function getVisibilityFromPath(
  path: string[],
  lookupIn: Visibility | ValidationVisibilitySelector,
): Visibility | undefined {
  const findFromRoot = (root: Visibility) => {
    let found = root;
    for (const key of path) {
      const nextVisibility = getChildVisibility(found, key);
      if (!nextVisibility) {
        return undefined;
      }
      found = nextVisibility;
    }
    return found;
  };

  if (typeof lookupIn === 'function') {
    return lookupIn(path.join('|'), findFromRoot);
  }
  return findFromRoot(lookupIn);
}

export function getVisibilityForNode(node: LayoutNode, lookupIn: Visibility | ValidationVisibilitySelector): number {
  const path = getPathFromRoot(node);
  const visibility = getVisibilityFromPath(path, lookupIn);
  return visibility?.mask ?? 0;
}

export function getResolvedVisibilityForAttachment(
  attachmentId: string,
  node: LayoutNode,
  selector: ValidationVisibilitySelector,
): number {
  let mask = getVisibilityForNode(node, selector);
  const path = getPathFromRoot(node);
  const nodeVisibility = getVisibilityFromPath(path, selector);
  if (!nodeVisibility) {
    return mask;
  }
  const attachmentVisibility = getChildVisibility(nodeVisibility, attachmentId);
  if (attachmentVisibility) {
    mask |= attachmentVisibility.mask;
  }
  return mask;
}

export function setVisibilityForNode(
  node: LayoutNode | LayoutPage,
  state: Visibility,
  mask: number,
  rowId?: string,
): void {
  const path = getPathFromRoot(node);
  if (typeof rowId !== 'undefined') {
    path.push(makeRowKey(rowId));
  }
  const visibility = getVisibilityFromPath(path, state);

  if (!visibility) {
    const keys = path.join(' -> ');
    window.logWarn(`Set node validation visibility: Could not find visibility for ${keys}`);
    return;
  }

  // Always keep showValidations categories visible
  const initialMask = getInitialMaskFromNode(node);

  visibility.mask = mask | initialMask;
}

export function setVisibilityForAttachment(attachmentId: string, node: LayoutNode, state: Visibility, mask: number) {
  const path = getPathFromRoot(node);
  path.push(attachmentId);

  const visibility = getVisibilityFromPath(path, state);

  if (!visibility) {
    const keys = path.join(' -> ');
    window.logWarn(`Set attachment validation visibility: Could not find visibility for ${keys}`);
    return;
  }

  visibility.mask = mask;
}
