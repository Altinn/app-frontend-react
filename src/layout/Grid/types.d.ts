import type { ExpressionOr, ExprResolved } from 'src/features/expressions/types';
import type { ComponentExceptGroupAndSummary, ILayoutCompBase, ILayoutComponent } from 'src/layout/layout';

export interface GridCellOptions {
  header?: boolean;
  readOnly?: boolean;
}

export interface GridComponentRef extends GridCellOptions {
  component: string;
}

export interface GridText extends GridCellOptions {
  text: ExpressionOr<string>;
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

export type ILayoutGridHierarchy = ExprResolved<ILayoutCompGrid<ComponentExceptGroupAndSummary>>;
