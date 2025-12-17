import { useEffect } from 'react';
import type { JSX } from 'react';

import { useLanguage } from 'src/features/language/useLanguage';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { NodeValidationProps } from 'src/layout/layout';

export function GridLayoutValidator(props: NodeValidationProps<'Grid'>): JSX.Element | null {
  const { intermediateItem, externalItem } = props;
  const rows = externalItem?.rows;
  const columns = externalItem?.columns;

  const { langAsString } = useLanguage();
  const addError = NodesInternal.useAddError();

  useEffect(() => {
    let error: string | null = null;

    if (Array.isArray(rows)) {
      for (const [i, row] of rows.entries()) {
        if (Array.isArray(row?.cells) && Array.isArray(columns) && row.cells.length !== columns?.length) {
          error = langAsString(`config_error.grid_diff_cell_columns`, [row.cells.length, i + 1, columns?.length]);
        }
        for (const [_, cell] of row.cells.entries()) {
          if (cell?.columnOptions && columns) {
            error = langAsString('config_error.grid_column_option_cell');
          }
        }
      }
    }

    if (error) {
      addError(error, intermediateItem.id, 'node');
      window.logErrorOnce(`Validation error for '${intermediateItem.id}': ${error}`);
    }
  }, [addError, columns, columns?.length, intermediateItem.id, langAsString, rows]);

  return null;
}
