import type { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import type { CompTypes } from 'src/layout/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { BaseItemState, ItemStore, StateFactoryProps } from 'src/utils/layout/itemState';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * A node state plugin work when generating code for a component. Adding such a plugin to your component
 * will extend the functionality of the component storage. The output of these functions will be added to the
 * generated code for the component.
 */
export abstract class NodeStatePlugin<Type extends CompTypes, StateExtension, EvalOutput> {
  public import: GenerateImportedSymbol<any>;

  public constructor() {
    this.import = this.makeImport();
  }

  public toString() {
    return this.import.toString();
  }

  abstract makeImport(): GenerateImportedSymbol<any>;
  abstract stateFactory(props: StateFactoryProps<Type>): StateExtension;
  abstract evalDefaultExpressions(props: ExprResolver<Type>): EvalOutput;
}

/**
 * Implement this interface if your component needs to support children in some form.
 */
export interface NodeStateChildrenPlugin<Type extends CompTypes, StateExtension> {
  pickDirectChildren(state: StateExtension & BaseItemState<Type>, restriction?: ChildLookupRestriction): ItemStore[];
  pickChild<C extends CompTypes>(
    state: StateExtension & BaseItemState<Type>,
    childId: string,
    parentPath: string[],
  ): ItemStore<C>;
  addChild(state: StateExtension & BaseItemState<Type>, childNode: LayoutNode, childStore: ItemStore): void;
  removeChild(state: StateExtension & BaseItemState<Type>, childNode: LayoutNode): void;
}

export function implementsNodeStateChildrenPlugin(plugin: any): plugin is NodeStateChildrenPlugin<any, any> {
  return (
    typeof plugin.pickDirectChildren === 'function' &&
    typeof plugin.pickChild === 'function' &&
    typeof plugin.addChild === 'function' &&
    typeof plugin.removeChild === 'function'
  );
}
