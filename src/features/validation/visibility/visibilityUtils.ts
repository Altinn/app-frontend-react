import { getInitialMaskFromNode } from 'src/features/validation/utils';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
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

function getChildVisibility(visibility: Visibility, key: string): Visibility | undefined {
  return visibility.children[key];
}

function getVisibilityFromPath(path: string[], lookupIn: Visibility): Visibility | undefined {
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

  return findFromRoot(lookupIn);
}

export function getVisibilityForNode(node: LayoutNode, lookupIn: Visibility): number {
  const path = getPathFromRoot(node);
  const visibility = getVisibilityFromPath(path, lookupIn);
  return visibility?.mask ?? 0;
}

export function getResolvedVisibilityForAttachment(
  attachmentVisibility: number | undefined,
  nodeVisibility: number,
): number {
  let mask = nodeVisibility;
  if (attachmentVisibility) {
    mask |= attachmentVisibility;
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
