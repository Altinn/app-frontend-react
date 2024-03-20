import { isNodeRef } from 'src/utils/layout/nodeRef';
import type { GridCell, GridCellLabelFrom, GridCellText, GridRow, GridRows } from 'src/layout/common.generated';
import type { GridCellInternal, GridCellNodeRef } from 'src/layout/Grid/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function nodesFromGrid(grid: LayoutNode<'Grid'>): LayoutNode[] {
  return nodesFromGridRows(grid.item.rows);
}

export function nodesFromGridRows(rows: GridRows): LayoutNode[] {
  const out: LayoutNode[] = [];
  for (const row of rows) {
    if (isGridRowHidden(row)) {
      continue;
    }

    out.push(...nodesFromGridRow(row));
  }

  return out;
}

export function nodesFromGridRow(row: GridRow): LayoutNode[] {
  const out: LayoutNode[] = [];
  for (const cell of row.cells) {
    if (isNodeRef(cell)) {
      out.push(cell.node);
    }
  }

  return out;
}

export function isGridRowHidden(row: GridRow) {
  let atLeastNoneNodeExists = false;
  const allCellsAreHidden = row.cells.every((cell) => {
    if (isNodeRef(cell)) {
      atLeastNoneNodeExists = true;
      return node.isHidden();
    }

    // Non-component cells always collapse and hide if components in other cells are hidden
    return true;
  });

  return atLeastNoneNodeExists && allCellsAreHidden;
}

export function isGridCellText(cell: GridCellInternal | GridCell): cell is GridCellText {
  return !!(cell && 'text' in cell && cell.text !== undefined);
}

export function isGridCellLabelFrom(cell: GridCellInternal | GridCell): cell is GridCellLabelFrom {
  return !!(cell && 'labelFrom' in cell && cell.labelFrom !== undefined);
}

export function isGridCellEmpty(cell: GridCellInternal | GridCell): boolean {
  return cell === null || (isGridCellText(cell) && cell.text === '');
}

export function isGridCellNode(cell: GridCellInternal): cell is GridCellNodeRef {
  return isNodeRef(cell);
}
