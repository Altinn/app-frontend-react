import { isNodeRef } from 'src/utils/layout/nodeRef';
import { useIsHiddenViaRules, useNodeSelector } from 'src/utils/layout/NodesContext';
import type { GridCell, GridCellLabelFrom, GridCellText, GridRow, GridRows } from 'src/layout/common.generated';
import type { GridCellInternal, GridCellNodeRef } from 'src/layout/Grid/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IsHiddenViaRulesSelector, NodeSelector } from 'src/utils/layout/NodesContext';

export function useNodesFromGrid(grid: LayoutNode<'Grid'> | undefined, enabled = true) {
  const isHiddenSelector = useIsHiddenViaRules();
  const nodeSelector = useNodeSelector();
  return enabled && grid ? nodesFromGrid(grid, isHiddenSelector, nodeSelector) : [];
}

export function nodesFromGrid(
  grid: LayoutNode<'Grid'>,
  isHiddenSelector: IsHiddenViaRulesSelector,
  nodeSelector: NodeSelector,
): LayoutNode[] {
  return nodesFromGridRows(grid.item.rows, isHiddenSelector, nodeSelector);
}

export function useNodesFromGridRows(rows: GridRows | undefined, enabled = true) {
  const isHiddenSelector = useIsHiddenViaRules();
  const nodeSelector = useNodeSelector();
  return enabled && rows ? nodesFromGridRows(rows, isHiddenSelector, nodeSelector) : [];
}

export function nodesFromGridRows(
  rows: GridRows,
  isHiddenSelector: IsHiddenViaRulesSelector,
  nodeSelector: NodeSelector,
): LayoutNode[] {
  const out: LayoutNode[] = [];
  for (const row of rows) {
    if (isGridRowHidden(row, isHiddenSelector)) {
      continue;
    }

    out.push(...nodesFromGridRow(row, nodeSelector));
  }

  return out;
}

export function nodesFromGridRow(row: GridRow, nodeSelector: NodeSelector): LayoutNode[] {
  const out: LayoutNode[] = [];
  for (const cell of row.cells) {
    if (isNodeRef(cell)) {
      const node = nodeSelector(cell);
      node && out.push(node);
    }
  }

  return out;
}

export function isGridRowHidden(row: GridRow, isHiddenSelector: IsHiddenViaRulesSelector) {
  let atLeastNoneNodeExists = false;
  const allCellsAreHidden = row.cells.every((cell) => {
    if (isNodeRef(cell)) {
      atLeastNoneNodeExists = true;
      return isHiddenSelector(cell);
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
