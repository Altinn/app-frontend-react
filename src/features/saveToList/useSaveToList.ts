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
  const setLeafValue = FD.useSetLeafValue();
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
      if (isDeleted) {
        const pathSegments = bindings.isDeleted?.field.split('.');
        const lastElement = pathSegments?.pop();
        const newPath = `${pathSegments?.join('.')}[${index}].${lastElement}`;
        setLeafValue({
          reference: { ...bindings.isDeleted, field: newPath } as IDataModelReference,
          newValue: !!isDeleted,
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
      const uuid = uuidv4();
      const next: Row = { [ALTINN_ROW_ID]: uuid };
      if (isDeleted) {
        next[isDeleted.field.split('.').reverse()[0]] = false;
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
  };

  return { setList, isRowChecked };
};
