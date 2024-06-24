import { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { CompWithBehavior } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodesStoreFull } from 'src/utils/layout/NodesContext';
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

function nodeDataToOptions(s: NodeData): IOptionInternal[] {
  return 'options' in s && s.options && Array.isArray(s.options) && s.options.length
    ? (s.options as IOptionInternal[])
    : emptyArray;
}

function nodeDataToIsFetching(s: NodeData): boolean {
  return 'isFetchingOptions' in s && typeof s.isFetchingOptions === 'boolean' ? s.isFetchingOptions : false;
}

export class OptionsStorePlugin extends NodeDataPlugin<OptionsStorePluginConfig> {
  extraFunctions(_set: NodeDataPluginSetState) {
    return undefined;
  }

  extraHooks(store: NodesStoreFull): OptionsStorePluginConfig['extraHooks'] {
    return {
      useNodeOptions: (node) =>
        store.useSelector((state) => {
          const s = state.nodeData[node.getId()];
          return { isFetching: nodeDataToIsFetching(s), options: nodeDataToOptions(s) };
        }),
      useNodeOptionsSelector: () =>
        store.useDelayedSelector({
          mode: 'simple',
          selector: (node: LayoutNode<CompWithBehavior<'canHaveOptions'>>) => (state) => {
            const store = state.nodeData[node.getId()];
            return { isFetching: nodeDataToIsFetching(store), options: nodeDataToOptions(store) };
          },
        }),
    };
  }
}
