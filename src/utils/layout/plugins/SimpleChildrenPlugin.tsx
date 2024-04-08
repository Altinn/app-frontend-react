import { CG } from 'src/codegen/CG';
import { NodeStatePlugin } from 'src/utils/layout/NodeStatePlugin';
import type { NodeRef } from 'src/layout';
import type { CompTypes } from 'src/layout/layout';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { ItemStore } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  NodeStateChildrenPlugin,
  PluginExprResolver,
  PluginState,
  PluginStateFactoryProps,
} from 'src/utils/layout/NodeStatePlugin';

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

  stateFactory(_props: PluginStateFactoryProps<Config<Type>>): Config<Type>['extraState'] {
    return {
      childItems: {},
    };
  }

  evalDefaultExpressions(props: PluginExprResolver<Config<Type>>): Config<Type>['extraInItem'] {
    return {
      children: undefined,
      childComponents: Object.keys(props.state?.childItems || {}).map((id) => ({
        nodeRef: id,
      })),
    };
  }

  pickDirectChildren(state: PluginState<Config<Type>>, _restriction?: ChildLookupRestriction): NodeRef[] {
    return state.item?.childComponents || [];
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
