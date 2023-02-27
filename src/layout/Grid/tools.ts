import type { ComponentInGrid } from 'src/layout/Grid/types';

export function isGridComponent(cell: any): cell is ComponentInGrid {
  return cell && 'id' in cell;
}
