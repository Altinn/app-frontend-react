import { v4 as uuidv4 } from 'uuid';

import { FD } from 'src/features/formData/FormDataWrite';
import { ALTINN_ROW_ID, DEFAULT_DEBOUNCE_TIMEOUT } from 'src/features/formData/types';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { IDataModelBindingsForSaveTolistCheckbox } from 'src/layout/Checkboxes/config.generated';
import type { IDataModelReference } from 'src/layout/common.generated';

type Row = Record<string, string | number | boolean>;

export const useSaveToList = (node) => {
  const bindings = useNodeItem(node, (i) => i.dataModelBindings) as IDataModelBindingsForSaveTolistCheckbox;
  const isDeleted = bindings.isDeleted;
  const isDeletedKey = isDeleted?.field.split('.').pop();
  const setLeafValue = FD.useSetLeafValue();
  const { formData } = useDataModelBindings(bindings, DEFAULT_DEBOUNCE_TIMEOUT, 'raw');
  const appendToList = FD.useAppendToList();
  const removeFromList = FD.useRemoveIndexFromList();

  const getObjectFromFormDataRow = (row: Row): Row | undefined =>
    (formData?.saveToList as Row[]).find((selectedRow) =>
      Object.keys(row).every((key) => Object.hasOwn(selectedRow, key) && row[key] === selectedRow[key]),
    );

  const getIndexFromFormDataRow = (row: Row) =>
    (formData?.saveToList as Row[]).findIndex((selectedRow) => {
      const { altinnRowId: _ } = selectedRow;
      return Object.keys(row).every((key) => Object.hasOwn(selectedRow, key) && row[key] === selectedRow[key]);
    });

  function isRowChecked(row: Row): boolean {
    const formDataObject = getObjectFromFormDataRow(row);

    if (isDeletedKey) {
      return !!formDataObject && !formDataObject[isDeletedKey];
    }
    return !!formDataObject;
  }

  const setList = (row) => {
    if (!bindings.saveToList) {
      return;
    }
    if (isRowChecked(row)) {
      const index = getIndexFromFormDataRow(row);
      if (isDeleted) {
        const pathSegments = bindings.isDeleted?.field.split('.');
        const lastElement = pathSegments?.pop();
        const newPath = `${pathSegments?.join('.')}[${index}].${lastElement}`;
        setLeafValue({
          reference: { ...bindings.isDeleted, field: newPath } as IDataModelReference,
          newValue: true,
        });
      } else {
        if (index >= 0) {
          removeFromList({
            reference: bindings.saveToList,
            index,
          });
        }
      }
    } else {
      const formDataObject = getObjectFromFormDataRow(row);
      if (formDataObject && isDeletedKey && formDataObject[isDeletedKey]) {
        const index = getIndexFromFormDataRow(row);
        const pathSegments = bindings.isDeleted?.field.split('.');
        const lastElement = pathSegments?.pop();
        const newPath = `${pathSegments?.join('.')}[${index}].${lastElement}`;
        setLeafValue({
          reference: { ...bindings.isDeleted, field: newPath } as IDataModelReference,
          newValue: false,
        });
      } else {
        const uuid = uuidv4();
        const next: Row = { [ALTINN_ROW_ID]: uuid };
        if (isDeletedKey) {
          next[isDeletedKey] = false;
        }
        for (const binding of Object.keys(bindings)) {
          if (binding === 'simpleBinding') {
            const propertyName = bindings.simpleBinding.field.split('.')[1];
            next[propertyName] = row[propertyName];
          } else if (binding !== 'saveToList' && binding !== 'label' && binding !== 'metadata') {
            next[binding] = row[binding];
          }
        }
        appendToList({
          reference: bindings.saveToList,
          newValue: next,
        });
      }
    }
  };

  return { setList, isRowChecked };
};
