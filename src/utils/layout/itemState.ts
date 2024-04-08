import type { CompDef } from 'src/layout';
import type { CompExternalExact, CompInternal, CompTypes, TypeFromNode } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

/**
 * A row (from the data model) in a repeating group, or other components using such a structure (object[]).
 * The `uuid` is a unique identifier for the row, and `index` is the index of the row in the array. The uuid is either
 * added by us or the backend, and is used to keep track of the row when it's moved around in the array, so that
 * our JsonPatch generation can be as efficient as possible and always target a change in the correct row.
 */
export interface BaseRow {
  uuid: string;
  index: number;
}

export interface StateFactoryProps<Type extends CompTypes> {
  item: CompExternalExact<Type>;
  parent: LayoutNode | LayoutPage;
  row?: BaseRow;
}

export interface BaseItemState<T extends CompTypes, Internal = CompInternal<T>> {
  type: 'node';
  layout: CompExternalExact<T>;
  item: Internal | undefined;
  hidden: boolean;
  ready: boolean;
}

export type ItemStore<Type extends CompTypes = CompTypes> = ReturnType<CompDef<Type>['stateFactory']>;
export type ItemStoreFromNode<N extends LayoutNode> = ItemStore<TypeFromNode<N>>;
