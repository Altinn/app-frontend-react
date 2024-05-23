import { NodePathNotFound } from 'src/utils/layout/NodePathNotFound';
import { pickDataStorePath } from 'src/utils/layout/NodesContext';
import { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { CompWithBehavior } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodesDataContext, NodesDataStoreFull } from 'src/utils/layout/NodesContext';
import type { NodeDataPluginSetState } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { NodeData } from 'src/utils/layout/types';

export type NodeOptionsSelector = (node: LayoutNode<CompWithBehavior<'canHaveOptions'>>) => {
  isFetching: boolean;
  options: IOptionInternal[];
};

export interface OptionsStorePluginConfig {
  extraFunctions: undefined;
  extraHooks: {
    useNodeOptions: NodeOptionsSelector;
    useNodeOptionsSelector: () => NodeOptionsSelector;
  };
}

const emptyArray: IOptionInternal[] = [];

function nodeStoreToOptions(s: NodeData): IOptionInternal[] {
  return s.type === 'node' && 'options' in s && s.options && Array.isArray(s.options) && s.options.length
    ? (s.options as IOptionInternal[])
    : emptyArray;
}

function nodeStoreToIsFetching(s: NodeData): boolean {
  return s.type === 'node' && 'isFetchingOptions' in s && typeof s.isFetchingOptions === 'boolean'
    ? s.isFetchingOptions
    : false;
}

export class OptionsStorePlugin extends NodeDataPlugin<OptionsStorePluginConfig> {
  extraFunctions(_set: NodeDataPluginSetState<NodesDataContext>) {
    return undefined;
  }

  extraHooks(store: NodesDataStoreFull): OptionsStorePluginConfig['extraHooks'] {
    return {
      useNodeOptions: (node) =>
        store.useSelector((state) => {
          try {
            const s = pickDataStorePath(state.pages, node) as NodeData;
            return { isFetching: nodeStoreToIsFetching(s), options: nodeStoreToOptions(s) };
          } catch (e) {
            if (e instanceof NodePathNotFound) {
              return { isFetching: false, options: emptyArray };
            }
            throw e;
          }
        }),
      useNodeOptionsSelector: () =>
        store.useDelayedMemoSelectorFactory((node: LayoutNode<CompWithBehavior<'canHaveOptions'>>) => (state) => {
          try {
            const store = pickDataStorePath(state.pages, node) as NodeData;
            return { isFetching: nodeStoreToIsFetching(store), options: nodeStoreToOptions(store) };
          } catch (e) {
            if (e instanceof NodePathNotFound) {
              return { isFetching: false, options: emptyArray };
            }
            throw e;
          }
        }),
    };
  }
}
