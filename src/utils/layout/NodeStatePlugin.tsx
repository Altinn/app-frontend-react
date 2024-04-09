import type { ComponentConfig } from 'src/codegen/ComponentConfig';
import type { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import type { NodeRef } from 'src/layout';
import type { CompInternal, CompTypes } from 'src/layout/layout';
import type { ChildClaimerProps, ExprResolver } from 'src/layout/LayoutComponent';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { BaseItemState, ItemStore, StateFactoryProps } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface PluginConfig {
  componentType: CompTypes;
  expectedFromExternal: any;
  extraState: any;
  extraInItem: any;
  settings?: any;
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
export type PluginCompExternal<Config extends PluginConfig> = Config['expectedFromExternal'];
export type PluginChildClaimerProps<Config extends PluginConfig> = ChildClaimerProps<PluginCompType<Config>> & {
  item: PluginCompExternal<Config>;
};
export type PluginSettings<Config extends PluginConfig> = Config['settings'];

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

  /**
   * This makes sure the code generator can use ${plugin} in string templates to automatically import the correct
   * symbol in the target file.
   */
  public toString() {
    return this.import.toString();
  }

  /**
   * Makes the import object. This will run on instantiation of the plugin.
   */
  abstract makeImport(): GenerateImportedSymbol<any>;

  /**
   * Adds the plugin to the component. This can be used to verify that the target component is valid and can include
   * the plugin, and/or add custom properties to the component that is needed for this plugin to work.
   */
  abstract addToComponent(component: ComponentConfig): void;

  /**
   * Makes a key that keeps this plugin unique. This is used to make sure that if we're adding the same plugin
   * multiple times to the same component, only uniquely configured plugins are added.
   */
  getKey(): string {
    // By default, no duplicate plugins of the same type are allowed.
    return this.constructor.name;
  }

  /**
   * Makes constructor arguments (must be a string, most often JSON). This is used to add custom constructor arguments
   * when instantiating this plugin in code generation.
   */
  makeConstructorArguments(): string {
    return '';
  }

  /**
   * Adds state factory properties to the component. This is called when creating the state for the component for the
   * first time.
   */
  abstract stateFactory(props: PluginStateFactoryProps<Config>): PluginExtraState<Config>;

  /**
   * Evaluates some expressions for the component. This can be used to add custom expressions to the component.
   */
  abstract evalDefaultExpressions(props: PluginExprResolver<Config>): PluginExtraInItem<Config>;
}

/**
 * Implement this interface if your plugin/component needs to support children in some form.
 */
export interface NodeStateChildrenPlugin<Config extends PluginConfig> {
  claimChildren(props: PluginChildClaimerProps<Config>): void;
  pickDirectChildren(state: PluginState<Config>, restriction?: ChildLookupRestriction): NodeRef[];
  pickChild<C extends CompTypes>(state: PluginState<Config>, childId: string, parentPath: string[]): ItemStore<C>;
  addChild(state: PluginState<Config>, childNode: LayoutNode, childStore: ItemStore): void;
  removeChild(state: PluginState<Config>, childNode: LayoutNode): void;
}

export function isNodeStateChildrenPlugin(plugin: any): plugin is NodeStateChildrenPlugin<any> {
  return (
    typeof plugin.claimChildren === 'function' &&
    typeof plugin.pickDirectChildren === 'function' &&
    typeof plugin.pickChild === 'function' &&
    typeof plugin.addChild === 'function' &&
    typeof plugin.removeChild === 'function'
  );
}
