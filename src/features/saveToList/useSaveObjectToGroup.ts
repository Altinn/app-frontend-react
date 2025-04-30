import dot from 'dot-object';
import { v4 as uuidv4 } from 'uuid';

import { FD } from 'src/features/formData/FormDataWrite';
import { ALTINN_ROW_ID, DEFAULT_DEBOUNCE_TIMEOUT } from 'src/features/formData/types';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import type { IDataModelBindingsForGroupCheckbox } from 'src/layout/Checkboxes/config.generated';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { IDataModelBindingsForList } from 'src/layout/List/config.generated';
import type { IDataModelBindingsForGroupMultiselect } from 'src/layout/MultipleSelect/config.generated';

type Row = Record<string, unknown>;

export const useSaveObjectToGroup = (
  bindings: IDataModelBindingsForGroupCheckbox | IDataModelBindingsForGroupMultiselect | IDataModelBindingsForList,
) => {
  const { formData } = useDataModelBindings(bindings, DEFAULT_DEBOUNCE_TIMEOUT, 'raw');
  const setLeafValue = FD.useSetLeafValue();
  const appendToList = FD.useAppendToList();
  const removeFromList = FD.useRemoveIndexFromList();

  const checkedBindingPath = bindings.group
    ? bindings.checked?.field.substring(bindings.group.field.length + 1)
    : undefined;

  function isTheSameRow(row1: Row, row2: Row) {
    if (!bindings.group) {
      return false;
    }

    for (const key of Object.keys(row1)) {
      // TODO: This should loop all the relevant bindings, not the row keys
      const binding = bindings[key] as IDataModelReference | undefined;
      if (!binding) {
        return false;
      }

      const path = binding.field.substring(bindings.group.field.length + 1);
      if (dot.pick(path, row1) !== dot.pick(path, row2)) {
        return false;
      }
    }
    return true;
  }

  function findRowInFormData(row: Row): [number | undefined, Row | undefined] {
    const list = formData?.group as Row[] | undefined;
    for (const [index, formDataRow] of list?.entries() ?? []) {
      if (isTheSameRow(row, formDataRow)) {
        return [index, formDataRow];
      }
    }

    return [undefined, undefined];
  }

  function isRowChecked(row: Row) {
    const [, formDataObject] = findRowInFormData(row);
    if (checkedBindingPath && formDataObject) {
      return !!dot.pick(checkedBindingPath, formDataObject);
    }
    return false;
  }

  function toggleRowSelectionInList(row: Row): void {
    if (!bindings.group) {
      return;
    }

    const [index, formDataObject] = findRowInFormData(row);
    if (isRowChecked(row)) {
      const newField = `${bindings.group.field}[${index}].${checkedBindingPath}`;
      if (newField) {
        setLeafValue({ reference: { ...bindings.checked, field: newField } as IDataModelReference, newValue: false });
      } else if (index !== undefined) {
        removeFromList({ reference: bindings.group, index });
      }
    } else {
      if (checkedBindingPath && formDataObject && dot.pick(checkedBindingPath, formDataObject) !== 'undefined') {
        const newField = `${bindings.group.field}[${index}].${checkedBindingPath}`;
        setLeafValue({ reference: { ...bindings.checked, field: newField } as IDataModelReference, newValue: true });
      } else {
        const uuid = uuidv4();
        const newRow: Row = { [ALTINN_ROW_ID]: uuid };

        for (const [key, binding] of Object.entries(bindings)) {
          // TODO: Only loop the relevant bindings here (which is only simpleBinding for checkboxes/multipleselect
          if (!bindings.group) {
            continue;
          }
          const path = binding.field.substring(bindings.group.field.length + 1);
          if (key === 'checked') {
            dot.str(path, true, newRow);
          } else if (key !== 'group') {
            dot.str(path, row[key], newRow);
          }
        }
        appendToList({ reference: bindings.group, newValue: newRow });
      }
    }
  }

  return { toggleRowSelectionInList, isRowChecked };
};
