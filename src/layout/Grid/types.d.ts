import type { ExprResolved } from 'src/features/expressions/types';
import type { ILayoutCompBase, ILayoutComponent } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/hierarchy';
import type { AnyItem } from 'src/utils/layout/hierarchy.types';

export interface GridCellOptions {
  header?: boolean; // TODO: Support expressions here?
  readOnly?: boolean; // TODO: Support expressions here?
}

export interface GridComponentRef extends GridCellOptions {
  component: string;
}

export interface GridText extends GridCellOptions {
  text: string; // TODO: Support expressions here
}

export type GridCell<C = GridComponentRef> = C | GridText | null;

export interface GridRow<C = GridComponentRef> extends GridCellOptions {
  cells: GridCell<C>[];
}

export interface ILayoutCompGrid<C = GridComponentRef> extends ILayoutCompBase<'Grid'> {
  rows: GridRow<C>[];
}

// TODO: Restrict this to only allow component types that work inside a grid
export type ComponentInGrid = ExprResolved<Exclude<ILayoutComponent, ILayoutCompGrid>>;

export type ILayoutGridHierarchy = ExprResolved<ILayoutCompGrid<LayoutNode<Exclude<AnyItem, { type: 'Grid' }>>>>;
