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
  const checkedBinding = bindings.checked;
  const checkedBindingSegments = checkedBinding?.field.split('.');
  const checkedBindingKey = checkedBindingSegments?.pop();

  const setLeafValue = FD.useSetLeafValue();
  const { formData } = useDataModelBindings(bindings, DEFAULT_DEBOUNCE_TIMEOUT, 'raw');
  const appendToList = FD.useAppendToList();
  const removeFromList = FD.useRemoveIndexFromList();

  const getObjectFromFormDataRow = (row: Row): Row | undefined =>
    (formData?.group as Row[])?.find((selectedRow) =>
      Object.keys(row).every((key) => Object.hasOwn(selectedRow, key) && row[key] === selectedRow[key]),
    );

  const getIndexFromFormDataRow = (row: Row) =>
    (formData?.group as Row[]).findIndex((selectedRow) => {
      const { altinnRowId: _ } = selectedRow;
      return Object.keys(row).every((key) => Object.hasOwn(selectedRow, key) && row[key] === selectedRow[key]);
    });

  const isRowChecked = (row: Row): boolean => {
    const formDataObject = getObjectFromFormDataRow(row);
    if (checkedBindingKey) {
      return !!formDataObject && !!formDataObject[checkedBindingKey];
    }
    return !!formDataObject;
  };

  const setList = (row: Row) => {
    if (!bindings.group) {
      return;
    }
    if (isRowChecked(row)) {
      const index = getIndexFromFormDataRow(row);
      if (checkedBinding) {
        setLeafValue({
          reference: {
            ...bindings.checked,
            field: `${checkedBindingSegments?.join('.')}[${index}].${checkedBindingKey}`,
          } as IDataModelReference,
          newValue: false,
        });
      } else {
        if (index >= 0) {
          removeFromList({
            reference: bindings.group,
            index,
          });
        }
      }
    } else {
      const formDataObject = getObjectFromFormDataRow(row);
      if (formDataObject && checkedBindingKey && formDataObject[checkedBindingKey]) {
        const index = getIndexFromFormDataRow(row);
        setLeafValue({
          reference: {
            ...bindings.checked,
            field: `${checkedBindingSegments?.join('.')}[${index}].${checkedBindingKey}`,
          } as IDataModelReference,
          newValue: true,
        });
      } else {
        const uuid = uuidv4();
        const next: Row = { [ALTINN_ROW_ID]: uuid };
        if (checkedBindingKey) {
          next[checkedBindingKey] = true;
        }
        for (const binding of Object.keys(bindings)) {
          if (binding === 'simpleBinding') {
            const propertyName = bindings.simpleBinding.field.split('.').pop();
            if (propertyName) {
              next[propertyName] = row[propertyName];
            }
          } else if (binding !== 'group' && binding !== 'label' && binding !== 'metadata') {
            next[binding] = row[binding];
          }
        }
        appendToList({
          reference: bindings.group,
          newValue: next,
        });
      }
    }
  };

  return { setList, isRowChecked };
};
