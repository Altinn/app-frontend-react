import dot from 'dot-object';
import { v4 as uuidv4 } from 'uuid';

import { FD } from 'src/features/formData/FormDataWrite';
import { ALTINN_ROW_ID, DEFAULT_DEBOUNCE_TIMEOUT } from 'src/features/formData/types';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { IDataModelBindingsForGroupCheckbox } from 'src/layout/Checkboxes/config.generated';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type Row = Record<string, string | number | boolean>;

export const useSaveObjectToGroup = (node: LayoutNode<'List' | 'Checkboxes' | 'MultipleSelect'>) => {
  const bindings = useNodeItem(node, (i) => i.dataModelBindings) as IDataModelBindingsForGroupCheckbox;
  const setLeafValue = FD.useSetLeafValue();
  const appendToList = FD.useAppendToList();
  const removeFromList = FD.useRemoveIndexFromList();
  const { formData } = useDataModelBindings(bindings, DEFAULT_DEBOUNCE_TIMEOUT, 'raw');

  const checkedBindingPath = bindings.group
    ? bindings.checked?.field.substring(bindings.group.field.length + 1)
    : undefined;

  const objectHasAllProperties = (row: Row, formDataRow: Row): boolean =>
    Object.keys(row).every((key) => {
      const binding = bindings[key];
      if (!binding || !bindings.group) {
        return false;
      }

      const path = binding.field.substring(bindings.group.field.length + 1);
      return row[key] === dot.pick(path, formDataRow);
    });

  const getObjectFromFormDataRow = (row: Row): Row | undefined =>
    (formData?.group as Row[])?.find((selectedRow) => objectHasAllProperties(row, selectedRow));

  const getIndexFromFormDataRow = (row: Row): number =>
    (formData?.group as Row[]).findIndex((selectedRow) => objectHasAllProperties(row, selectedRow));

  const isRowChecked = (row: Row): boolean => {
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
      if (index >= 0) {
        const newField = `${bindings.group.field}[${index}].${checkedBindingPath}`;
        setLeafValue({ reference: { ...bindings.checked, field: newField } as IDataModelReference, newValue: false });
        removeFromList({ reference: bindings.group, index });
      }
    } else {
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
          if (key === 'checked') {
            dot.str(path, true, newRow);
          } else if (key !== 'group' && key !== 'label' && key !== 'metadata') {
            dot.str(path, row[key], newRow);
          }
        });

        appendToList({ reference: bindings.group, newValue: newRow });
      }
    }
  };

  return { toggleRowSelectionInList, isRowChecked };
};
