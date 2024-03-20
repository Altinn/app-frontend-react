import type { NodeRef } from 'src/layout';
import type { GridCellLabelFrom, GridCellText, GridComponentRef, GridRow } from 'src/layout/common.generated';

export type GridCellNodeRef = NodeRef & Omit<GridComponentRef, 'component'>;

export type GridCellInternal = GridCellNodeRef | null | GridCellText | GridCellLabelFrom;

export interface GridRowInternal extends Omit<GridRow, 'cells'> {
  cells: GridCellInternal[];
}

export type GridRowsInternal = GridRowInternal[];
