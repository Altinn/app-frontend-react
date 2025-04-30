import dot from 'dot-object';
import { v4 as uuidv4 } from 'uuid';

import { FD } from 'src/features/formData/FormDataWrite';
import { ALTINN_ROW_ID, DEFAULT_DEBOUNCE_TIMEOUT } from 'src/features/formData/types';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import type { IDataModelBindingsForGroupCheckbox } from 'src/layout/Checkboxes/config.generated';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { IDataModelBindingsForList } from 'src/layout/List/config.generated';
import type { IDataModelBindingsForGroupMultiselect } from 'src/layout/MultipleSelect/config.generated';

type Row = Record<string, string | number | boolean>;

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

  const objectHasAllProperties = (row: Row, formDataRow: Row): boolean => {
    console.log(row);
    return Object.keys(row).every((key) => {
      const binding = bindings[key];
      if (!binding || !bindings.group) {
        return false;
      }

      const path = binding.field.substring(bindings.group.field.length + 1);
      return row[key] === dot.pick(path, formDataRow);
    });
  };

  const getObjectFromFormDataRow = (row: Row): Row | undefined => {
    console.log(formData?.group);
    return (formData?.group as Row[])?.find((selectedRow) => {
      console.log(selectedRow);
      return objectHasAllProperties(row, selectedRow);
    });
  };

  const getIndexFromFormDataRow = (row: Row): number =>
    (formData?.group as Row[]).findIndex((selectedRow) => objectHasAllProperties(row, selectedRow));

  const isRowChecked = (row: Row): boolean => {
    console.log('isRowChecked');
    const formDataObject = getObjectFromFormDataRow(row);
    return !!(checkedBindingPath && formDataObject && dot.pick(checkedBindingPath, formDataObject));
  };

  const toggleRowSelectionInList = (row: Row): void => {
    if (!bindings.group) {
      return;
    }

    const index = getIndexFromFormDataRow(row);
    const formDataObject = getObjectFromFormDataRow(row);

    if (isRowChecked(row)) {
      const newField = `${bindings.group.field}[${index}].${checkedBindingPath}`;
      if (newField) {
        setLeafValue({ reference: { ...bindings.checked, field: newField } as IDataModelReference, newValue: false });
      } else {
        if (index >= 0) {
          removeFromList({ reference: bindings.group, index });
        }
      }
    } else {
      console.log(row);
      if (checkedBindingPath && formDataObject && dot.pick(checkedBindingPath, formDataObject) !== 'undefined') {
        const newField = `${bindings.group.field}[${index}].${checkedBindingPath}`;
        setLeafValue({ reference: { ...bindings.checked, field: newField } as IDataModelReference, newValue: true });
      } else {
        const uuid = uuidv4();
        const newRow: Row = { [ALTINN_ROW_ID]: uuid };

        Object.entries(bindings).forEach(([key, binding]) => {
          if (!bindings.group) {
            return;
          }
          const path = binding.field.substring(bindings.group.field.length + 1);
          console.log(key, path);
          if (key === 'checked') {
            dot.str(path, true, newRow);
          } else if (key !== 'group') {
            dot.str(path, row[key], newRow);
          }
        });
        console.log(newRow);
        appendToList({ reference: bindings.group, newValue: newRow });
      }
    }
  };

  return { toggleRowSelectionInList, isRowChecked };
};
