import type { ExprResolved } from 'src/features/expressions/types';
import type { ILayoutCompBase, ILayoutComponent } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/hierarchy';
import type { AnyItem } from 'src/utils/layout/hierarchy.types';

export interface GridComponentRef {
  component: string;
}

export interface GridText {
  text: string;
}

export type GridCell<C = GridComponentRef> = C | GridText | null;

export interface GridRow<C = GridComponentRef> extends GridCellOptions {
  header?: boolean;
  readOnly?: boolean;
  cells: GridCell<C>[];
}

export interface ILayoutCompGrid<C = GridComponentRef> extends ILayoutCompBase<'Grid'> {
  rows: GridRow<C>[];
}

export type ComponentInGrid = ExprResolved<Exclude<ILayoutComponent, ILayoutCompGrid>>;

export type ILayoutGridHierarchy = ExprResolved<ILayoutCompGrid<LayoutNode<Exclude<AnyItem, { type: 'Grid' }>>>>;
