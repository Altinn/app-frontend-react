import { getNodeConstructor } from 'src/layout';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { CompExternal, CompInternal, CompTypes, ParentNode } from 'src/layout/layout';
import type { LayoutNode, LayoutNodeProps } from 'src/utils/layout/LayoutNode';
import type { BaseRow } from 'src/utils/layout/types';

/**
 * This function creates a new LayoutNode for testing purposes. It is not meant to be used in production code, and
 * will break your stuff if you try.
 * TODO: Remove?
 */
export function newLayoutNodeForTesting<T extends CompTypes = CompTypes>(
  item: Partial<CompExternal<T>> | Partial<CompInternal<T>>,
  parent?: ParentNode,
  row?: BaseRow,
): LayoutNode {
  const LNode = getNodeConstructor(item.type as T);
  const _parent = parent || new LayoutPage();
  const props: LayoutNodeProps<T> = { item: item as any, parent: _parent, row };
  const node = new LNode(props as any) as LayoutNode;

  if (_parent instanceof LayoutPage) {
    _parent._addChild(node);
  }

  return node;
}
