import { getGridCellHiddenExpr } from 'src/layout/Grid/tools';
import type { GridCell } from 'src/layout/common.generated';

describe('getGridCellHiddenExpr', () => {
  it('returns undefined for non-object or null cells', () => {
    expect(getGridCellHiddenExpr(null as unknown as GridCell)).toBeUndefined();
    expect(getGridCellHiddenExpr(undefined as unknown as GridCell)).toBeUndefined();
    expect(getGridCellHiddenExpr('text' as unknown as GridCell)).toBeUndefined();
  });

  it('reads hidden from columnOptions when present', () => {
    const cell = { columnOptions: { hidden: true } } as GridCell;
    expect(getGridCellHiddenExpr(cell)).toBe(true);
  });

  it('reads hidden from gridColumnOptions and prefers it over columnOptions', () => {
    const cell = {
      columnOptions: { hidden: false },
      gridColumnOptions: { hidden: true },
    } as GridCell;
    expect(getGridCellHiddenExpr(cell)).toBe(true);
  });
});
