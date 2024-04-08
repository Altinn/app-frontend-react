import { CG } from 'src/codegen/CG';
import { NodeStatePlugin } from 'src/utils/layout/NodeStatePlugin';
import type { NodeRef } from 'src/layout';
import type { CompTypes } from 'src/layout/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { ItemStore, StateFactoryProps } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeStateChildrenPlugin, PluginState } from 'src/utils/layout/NodeStatePlugin';

interface Config<Type extends CompTypes> {
  componentType: Type;
  extraState: {
    childItems: { [key: string]: ItemStore };
  };
  extraInItem: {
    children: undefined;
    childComponents: NodeRef[];
  };
}

export class SimpleChildrenPlugin<Type extends CompTypes>
  extends NodeStatePlugin<Config<Type>>
  implements NodeStateChildrenPlugin<Config<Type>>
{
  makeImport() {
    return new CG.import({
      import: 'SimpleChildrenPlugin',
      from: 'src/utils/layout/plugins/SimpleChildrenPlugin',
    });
  }

  stateFactory(_props: StateFactoryProps<Type>): {
    childItems: { [key: string]: ItemStore };
  } {
    return {
      childItems: {},
    };
  }

  evalDefaultExpressions(_props: ExprResolver<Type>): {
    children: undefined;
    childComponents: NodeRef[];
  } {
    return {
      children: undefined,
      childComponents: [],
    };
  }

  pickDirectChildren(state: PluginState<Config<Type>>, _restriction?: ChildLookupRestriction): NodeRef[] {
    return Object.keys(state.item?.childComponents || {}).map((key) => ({ nodeRef: key }));
  }

  pickChild<C extends CompTypes>(
    state: PluginState<Config<Type>>,
    childId: string,
    parentPath: string[],
  ): ItemStore<C> {
    const child = state.childItems[childId];
    if (!child) {
      throw new Error(`Child with id ${childId} not found in /${parentPath.join('/')}`);
    }
    return child as ItemStore<C>;
  }

  addChild(state: PluginState<Config<Type>>, childNode: LayoutNode, childStore: ItemStore): void {
    state.childItems[childNode.getId()] = childStore;
  }

  removeChild(state: PluginState<Config<Type>>, childNode: LayoutNode): void {
    delete state.childItems[childNode.getId()];
  }
}
