import { getNodeConstructor } from 'src/layout';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { createNodesDataStore } from 'src/utils/layout/NodesContext';
import type { CompExternal, CompInternal, CompTypes, ParentNode } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodesDataStore } from 'src/utils/layout/NodesContext';
import type { BaseRow } from 'src/utils/layout/types';

/**
 * This function creates a new LayoutNode for testing purposes. It is not meant to be used in production code, and
 * will break your stuff if you try.
 */
export function newLayoutNodeForTesting<T extends CompTypes = CompTypes>(
  item: Partial<CompExternal<T>> | Partial<CompInternal<T>>,
  parent?: ParentNode,
  row?: BaseRow,
  store?: NodesDataStore,
): LayoutNode {
  const id = item.id || 'test';
  const LNode = getNodeConstructor(item.type as T);
  const _parent = parent || new LayoutPage();
  const path: string[] = ['formLayout', id];
  const _store = store ?? createNodesDataStore();
  const node = new LNode(_store, path, _parent as any, row) as LayoutNode;

  if (_parent instanceof LayoutPage) {
    _parent._addChild(node);
  }

  return node;
}
