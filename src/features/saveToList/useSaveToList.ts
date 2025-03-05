import { v4 as uuidv4 } from 'uuid';

import { FD } from 'src/features/formData/FormDataWrite';
import { ALTINN_ROW_ID, DEFAULT_DEBOUNCE_TIMEOUT } from 'src/features/formData/types';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { IDataModelBindingsForSaveTolistCheckbox } from 'src/layout/Checkboxes/config.generated';

type Row = Record<string, string | number | boolean>;

export const useSaveToList = (node) => {
  const bindings = useNodeItem(node, (i) => i.dataModelBindings) as IDataModelBindingsForSaveTolistCheckbox;
  const { formData } = useDataModelBindings(bindings, DEFAULT_DEBOUNCE_TIMEOUT, 'raw');
  const appendToList = FD.useAppendToList();
  const removeFromList = FD.useRemoveIndexFromList();

  function isRowChecked(row: Row): boolean {
    return (formData?.saveToList as Row[]).some((selectedRow) =>
      Object.keys(row).every((key) => Object.hasOwn(selectedRow, key) && row[key] === selectedRow[key]),
    );
  }

  const setList = (row) => {
    if (!bindings.saveToList) {
      return;
    }
    if (isRowChecked(row)) {
      const index = (formData?.saveToList as Row[]).findIndex((selectedRow) => {
        const { altinnRowId: _ } = selectedRow;
        return Object.keys(row).every((key) => Object.hasOwn(selectedRow, key) && row[key] === selectedRow[key]);
      });
      if (index >= 0) {
        removeFromList({
          reference: bindings.saveToList,
          index,
        });
      }
    } else {
      const uuid = uuidv4();
      const next: Row = { [ALTINN_ROW_ID]: uuid };
      console.log('bindings', bindings);
      for (const binding of Object.keys(bindings)) {
        if (binding !== 'saveToList') {
          next[binding] = row[binding];
        }
      }
      console.log('next', next);

      appendToList({
        reference: bindings.saveToList,
        newValue: { ...next },
      });
    }
  };

  return { setList, list: formData.saveToList };
};
