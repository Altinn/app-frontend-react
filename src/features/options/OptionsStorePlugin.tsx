import { NodePathNotFound } from 'src/utils/layout/NodePathNotFound';
import { pickDataStorePath } from 'src/utils/layout/NodesContext';
import { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { CompWithBehavior } from 'src/layout/layout';
import type { ItemStore } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodesDataContext, NodesDataStoreFull } from 'src/utils/layout/NodesContext';
import type { NodeDataPluginSetState } from 'src/utils/layout/plugins/NodeDataPlugin';

export type NodeOptionsSelector = (node: LayoutNode<CompWithBehavior<'canHaveOptions'>>) => IOptionInternal[];

export interface OptionsStorePluginConfig {
  extraFunctions: undefined;
  extraHooks: {
    useNodeOptions: NodeOptionsSelector;
    useNodeOptionsSelector: () => NodeOptionsSelector;
  };
}

const emptyArray: never[] = [];

export class OptionsStorePlugin extends NodeDataPlugin<OptionsStorePluginConfig> {
  extraFunctions(_set: NodeDataPluginSetState<NodesDataContext>) {
    return undefined;
  }

  extraHooks(store: NodesDataStoreFull): OptionsStorePluginConfig['extraHooks'] {
    return {
      useNodeOptions: (node) =>
        store.useSelector((state) => {
          try {
            const nodeStore = pickDataStorePath(state.pages, node) as ItemStore;
            return 'options' in nodeStore ? nodeStore.options : emptyArray;
          } catch (e) {
            if (e instanceof NodePathNotFound) {
              return emptyArray;
            }
            throw e;
          }
        }),
      useNodeOptionsSelector: () =>
        store.useDelayedMemoSelectorFactory({
          selector: (node: LayoutNode<CompWithBehavior<'canHaveOptions'>>) => (state) => {
            try {
              const nodeStore = pickDataStorePath(state.pages, node) as ItemStore;
              return 'options' in nodeStore ? nodeStore.options : emptyArray;
            } catch (e) {
              if (e instanceof NodePathNotFound) {
                return emptyArray;
              }
              throw e;
            }
          },
          makeCacheKey: (node) => node.path.join('|'),
        }),
    };
  }
}
