import type { StoreApi } from 'zustand';

import type { CompExternal, CompInternal, CompTypes } from 'src/layout/layout';

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

interface BaseItemState<T extends CompTypes> {
  layout: CompExternal<T>;
  item: CompInternal<T>;
}

interface ItemFunctions {}

export type ItemStore<Type extends CompTypes> = StoreApi<BaseItemState<Type> & ItemFunctions>;
