import type { Draft } from 'immer';

import type { NodesDataContext, NodesDataStoreFull } from 'src/utils/layout/NodesContext';

export interface NodeDataPluginConfig {
  extraFunctions?: Record<string, (...args: any[]) => any>;
  extraHooks?: Record<string, (...args: any[]) => any>;
}

export type NodeDataPluginSetState<T> = (fn: (state: Draft<T>) => void) => void;
export type ConfigFromNodeDataPlugin<C extends NodeDataPlugin<any>> =
  C extends NodeDataPlugin<infer Config> ? Config : never;

export abstract class NodeDataPlugin<Config extends NodeDataPluginConfig> {
  abstract extraFunctions(set: NodeDataPluginSetState<NodesDataContext>): Config['extraFunctions'];
  abstract extraHooks(store: NodesDataStoreFull): Config['extraHooks'];
}
