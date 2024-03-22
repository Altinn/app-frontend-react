import { getLayoutComponentObject, getNodeConstructor } from 'src/layout';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { CompDef } from 'src/layout';
import type { CompExternal, CompInternal, CompTypes, ParentNode } from 'src/layout/layout';
import type { StoreFactoryProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { BaseRow, ItemStore } from 'src/utils/layout/types';

/**
 * This function creates a new LayoutNode for testing purposes. It is not meant to be used in production code, and
 * will break your stuff if you try.
 */
export function newLayoutNodeForTesting<T extends CompTypes = CompTypes>(
  item: Partial<CompExternal<T>> | Partial<CompInternal<T>>,
  parent?: ParentNode,
  row?: BaseRow,
): LayoutNode {
  const LNode = getNodeConstructor(item.type as T);
  const def = getLayoutComponentObject(item.type as T);
  const _parent = parent || new LayoutPage();
  const props = { item, parent: _parent, row } as StoreFactoryProps<T>;
  const store = (def as CompDef<T>).storeFactory(props as any) as ItemStore<T>;
  const node = new LNode(store as any, _parent as any, row) as LayoutNode;

  if (_parent instanceof LayoutPage) {
    _parent._addChild(node);
  }

  return node;
}
