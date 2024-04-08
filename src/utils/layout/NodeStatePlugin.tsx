import type { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import type { NodeRef } from 'src/layout';
import type { CompInternal, CompTypes } from 'src/layout/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { BaseItemState, ItemStore, StateFactoryProps } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface PluginConfig {
  componentType: CompTypes;
  extraState: any;
  extraInItem: any;
}

interface PluginBaseItemState<Config extends PluginConfig> extends BaseItemState<PluginCompType<Config>> {
  item: PluginCompInternal<Config> & PluginExtraInItem<Config>;
}

export type PluginCompType<Config extends PluginConfig> = Config['componentType'];
export type PluginExtraState<Config extends PluginConfig> = Config['extraState'];
export type PluginExtraInItem<Config extends PluginConfig> = Config['extraInItem'];
export type PluginCompInternal<Config extends PluginConfig> = CompInternal<PluginCompType<Config>>;
export type PluginState<Config extends PluginConfig> = PluginBaseItemState<Config> & PluginExtraState<Config>;
export type PluginStateFactoryProps<Config extends PluginConfig> = StateFactoryProps<PluginCompType<Config>>;
export type PluginExprResolver<Config extends PluginConfig> = ExprResolver<PluginCompType<Config>> & {
  state: PluginState<Config>;
};

/**
 * A node state plugin work when generating code for a component. Adding such a plugin to your component
 * will extend the functionality of the component storage. The output of these functions will be added to the
 * generated code for the component.
 */
export abstract class NodeStatePlugin<Config extends PluginConfig> {
  public import: GenerateImportedSymbol<any>;

  public constructor() {
    this.import = this.makeImport();
  }

  public toString() {
    return this.import.toString();
  }

  abstract makeImport(): GenerateImportedSymbol<any>;
  abstract stateFactory(props: PluginStateFactoryProps<Config>): PluginExtraState<Config>;
  abstract evalDefaultExpressions(props: PluginExprResolver<Config>): PluginExtraInItem<Config>;
}

/**
 * Implement this interface if your component needs to support children in some form.
 */
export interface NodeStateChildrenPlugin<Config extends PluginConfig> {
  pickDirectChildren(state: PluginState<Config>, restriction?: ChildLookupRestriction): NodeRef[];
  pickChild<C extends CompTypes>(state: PluginState<Config>, childId: string, parentPath: string[]): ItemStore<C>;
  addChild(state: PluginState<Config>, childNode: LayoutNode, childStore: ItemStore): void;
  removeChild(state: PluginState<Config>, childNode: LayoutNode): void;
}

export function isNodeStateChildrenPlugin(plugin: any): plugin is NodeStateChildrenPlugin<any> {
  return (
    typeof plugin.pickDirectChildren === 'function' &&
    typeof plugin.pickChild === 'function' &&
    typeof plugin.addChild === 'function' &&
    typeof plugin.removeChild === 'function'
  );
}
