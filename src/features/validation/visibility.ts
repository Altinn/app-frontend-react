import { groupIsRepeating } from 'src/layout/Group/tools';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type VisibilityNodeType = 'object' | 'list';

type BaseVisibility<T extends VisibilityNodeType = VisibilityNodeType> = {
  type: T;
  visible: boolean;
};

export type VisibilityObject = BaseVisibility<'object'> & {
  children: {
    [key: string]: Visibility<VisibilityNodeType>;
  };
};

type VisibilityList = BaseVisibility<'list'> & {
  children: VisibilityObject[];
};

type Visibility<T extends VisibilityNodeType = VisibilityNodeType> = {
  object: VisibilityObject;
  list: VisibilityList;
}[T];

type PathItem =
  | {
      type: 'object';
      key: string | number;
    }
  | {
      type: 'list';
      key: string;
    };

/**
 * Gets a nodes path from the root visibility
 */
function getPathFromRoot(node: LayoutNode | LayoutPage): PathItem[] {
  const path: PathItem[] = [];
  let currentNode: LayoutNode | LayoutPage = node;
  while (typeof currentNode !== 'undefined') {
    if (currentNode instanceof BaseLayoutNode) {
      const key = currentNode.item.baseComponentId ?? currentNode.item.id;
      const type = currentNode.isType('Group') && groupIsRepeating(currentNode.item) ? 'list' : 'object';
      path.push({ type, key });

      if (typeof currentNode.rowIndex !== 'undefined') {
        path.push({ type: 'object', key: currentNode.rowIndex });
      }
    }

    if (currentNode instanceof LayoutPage) {
      path.push({ type: 'object', key: currentNode.top.myKey });
    }

    currentNode = currentNode.parent;
  }

  return path.reverse();
}

export function addVisibilityForNode(node: LayoutNode, state: VisibilityObject): void {
  const path = getPathFromRoot(node);

  let currentVisibility: Visibility = state;
  for (const { type, key } of path) {
    if (!currentVisibility.children[key]) {
      currentVisibility.children[key] = {
        type,
        visible: false,
        children: type === 'list' ? [] : {},
      };
    }
    currentVisibility = currentVisibility.children[key];
  }
}

export function removeVisibilityForNode(node: LayoutNode, state: VisibilityObject): void {
  const path = getPathFromRoot(node);
  const pathToParent = path.slice(0, -1);
  const { key } = path.at(-1)!;

  // The parent of a node will always be an object
  const parentVisibility = getVisibilityFromPath(pathToParent, state) as Visibility<'object'> | undefined;
  if (parentVisibility) {
    delete parentVisibility.children[key];

    // If all children are removed from a list row, remove the list row visibility
    const parentKey = pathToParent.at(-1)?.key;
    if (typeof parentKey === 'number' && Object.keys(parentVisibility.children).length === 0) {
      // The parent of an object with a number key will always be a list
      const grandParentVisibility = getVisibilityFromPath(pathToParent.slice(0, -1), state) as
        | Visibility<'list'>
        | undefined;

      if (grandParentVisibility) {
        delete grandParentVisibility.children[parentKey];
      }
    }
  }
}

export function onBeforeRowDelete(groupNode: LayoutNode<'Group'>, rowIndex: number, state: VisibilityObject) {
  const path = getPathFromRoot(groupNode);
  const groupVisibility = getVisibilityFromPath(path, state);
  if (groupVisibility?.type === 'list') {
    groupVisibility.children.splice(rowIndex, 1);
  }
}

function getVisibilityFromPath(path: PathItem[], state: VisibilityObject): Visibility | undefined {
  let currentVisibility: Visibility = state;
  for (const { key } of path) {
    const nextVisibility = currentVisibility.children[key];

    if (!nextVisibility) {
      return undefined;
    }
    currentVisibility = nextVisibility;
  }
  return currentVisibility;
}

export function getRawVisibilityForNode(
  node: LayoutNode | LayoutPage,
  state: VisibilityObject,
  rowIndex?: number,
): boolean {
  const path = getPathFromRoot(node);
  if (typeof rowIndex !== 'undefined') {
    path.push({ type: 'object', key: rowIndex });
  }
  const visibility = getVisibilityFromPath(path, state);
  return visibility?.visible ?? false;
}

export function getResolvedVisibilityForNode(node: LayoutNode, state: VisibilityObject): boolean {
  if (state.visible) {
    return true;
  }

  const path = getPathFromRoot(node);

  let currentVisibility: Visibility = state;
  for (const { key } of path) {
    const nextVisibility = currentVisibility.children[key];

    if (!nextVisibility) {
      return false;
    }

    if (nextVisibility.visible) {
      return true;
    }

    currentVisibility = nextVisibility;
  }
  return false;
}

export function setVisibilityForNode(
  node: LayoutNode | LayoutPage,
  state: VisibilityObject,
  visible: boolean,
  rowIndex?: number,
): void {
  const path = getPathFromRoot(node);
  if (typeof rowIndex !== 'undefined') {
    path.push({ type: 'object', key: rowIndex });
  }
  const visibility = getVisibilityFromPath(path, state);

  if (!visibility) {
    const keys = path.map((p) => p.key).join(' -> ');
    window.logWarnOnce(`Could not find visibility for ${keys}`);
    return;
  }

  visibility.visible = visible;
}
