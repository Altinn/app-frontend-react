import dot from 'dot-object';
import { v4 as uuidv4 } from 'uuid';

import { FD } from 'src/features/formData/FormDataWrite';
import { ALTINN_ROW_ID } from 'src/features/formData/types';
import type { IDataModelBindingsForGroupCheckbox } from 'src/layout/Checkboxes/config.generated';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { IDataModelBindingsForList } from 'src/layout/List/config.generated';
import type { IDataModelBindingsForGroupMultiselect } from 'src/layout/MultipleSelect/config.generated';

type Row = Record<string, unknown>;

interface Bindings {
  group?: IDataModelReference;
  checked?: IDataModelReference;
  valueBindings: IDataModelReference[];
}

function toRelativePath(group: IDataModelReference | undefined, binding: IDataModelReference | undefined) {
  if (group && binding && binding.field.startsWith(`${group.field}.`)) {
    return binding.field.substring(group.field.length + 1);
  }
  return undefined;
}

function isEqual({ group, valueBindings }: Bindings, row1: Row, row2: Row) {
  for (const valueBinding of valueBindings) {
    const path = toRelativePath(group, valueBinding);
    if (path && dot.pick(path, row1) !== dot.pick(path, row2)) {
      return false;
    }
  }

  return true;
}

function findRowInFormData(
  bindings: Bindings,
  row: Row,
  formData: Row[] | undefined,
): [number | undefined, Row | undefined] {
  for (const [index, formDataRow] of formData?.entries() ?? []) {
    if (isEqual(bindings, row, formDataRow)) {
      return [index, formDataRow];
    }
  }

  return [undefined, undefined];
}

function useSaveToGroup(bindings: Bindings) {
  const { group, checked, valueBindings } = bindings;
  const formData = FD.useFreshBindings(group ? { group } : {}, 'raw').group as Row[] | undefined;
  const setLeafValue = FD.useSetLeafValue();
  const appendToList = FD.useAppendToList();
  const removeFromList = FD.useRemoveIndexFromList();
  const checkedPath = toRelativePath(group, checked);

  function toggle(row: Row): void {
    if (!group) {
      return;
    }

    const [index] = findRowInFormData(bindings, row, formData);
    const isChecked = !!(checkedPath ? dot.pick(checkedPath, row) : true);
    if (isChecked) {
      if (checked && checkedPath) {
        const field = `${group.field}[${index}].${checkedPath}`;
        setLeafValue({ reference: { ...checked, field }, newValue: false });
      } else if (index !== undefined) {
        removeFromList({ reference: group, index });
      }
    } else {
      if (checked && checkedPath && index !== undefined) {
        const field = `${group.field}[${index}].${checkedPath}`;
        setLeafValue({ reference: { ...checked, field }, newValue: true });
      } else {
        const uuid = uuidv4();
        const newRow: Row = { [ALTINN_ROW_ID]: uuid };
        if (checkedPath) {
          dot.str(checkedPath, true, newRow);
        }
        for (const valueBinding of valueBindings) {
          const path = toRelativePath(group, valueBinding);
          if (path) {
            dot.str(path, dot.pick(path, row), newRow);
          }
        }
        appendToList({ reference: group, newValue: newRow });
      }
    }
  }

  return { toggle, formData, checkedPath, enabled: !!group };
}

/**
 * Hook used to store List-component objects (rows from the DataList API) to a repeating group
 * structure in the data model (aka object[])
 */
export function useSaveObjectToGroup(listBindings: IDataModelBindingsForList) {
  const valueBindings: IDataModelReference[] = [];
  for (const key in listBindings) {
    const binding = listBindings[key];
    if (key !== 'group' && key !== 'checked' && binding) {
      valueBindings.push(binding);
    }
  }
  const bindings: Bindings = { group: listBindings.group, checked: listBindings.checked, valueBindings };
  const { formData, enabled, toggle, checkedPath } = useSaveToGroup(bindings);

  function isChecked(row: Row) {
    const [, formDataObject] = findRowInFormData(bindings, row, formData);
    if (checkedPath && formDataObject) {
      return !!dot.pick(checkedPath, formDataObject);
    }
    return false;
  }

  return { toggle, isChecked, enabled };
}

/**
 * Hook used to store simple values to a repeating group structure in the data model (aka. object[])
 */
export function useSaveValueToGroup(
  bindings: IDataModelBindingsForGroupCheckbox | IDataModelBindingsForGroupMultiselect,
) {
  const { formData, enabled, toggle, checkedPath } = useSaveToGroup({
    group: bindings.group,
    checked: bindings.checked,
    valueBindings: bindings.simpleBinding ? [bindings.simpleBinding] : [],
  });
  const valuePath = toRelativePath(bindings.group, bindings.simpleBinding);

  const selectedValues =
    valuePath && enabled && formData
      ? formData
          .filter((row) => (checkedPath ? dot.pick(checkedPath, row) : true))
          .map((row) => `${dot.pick(valuePath, row)}`)
      : [];

  function toggleValue(value: string) {
    if (!valuePath || !enabled) {
      return;
    }

    const asRow: Row = {};
    dot.str(valuePath, value, asRow);
    toggle(asRow);
  }

  function setCheckedValues(values: string[]) {
    if (!valuePath || !enabled) {
      return;
    }

    const valuesToSet = values.filter((value) => !selectedValues.includes(value));
    const valuesToRemove = selectedValues.filter((value) => !values.includes(value));
    const valuesToToggle = [...valuesToSet, ...valuesToRemove];

    for (const value of valuesToToggle) {
      const asRow: Row = {};
      dot.str(valuePath, value, asRow);
      toggle(asRow);
    }
  }

  return { selectedValues, toggleValue, setCheckedValues, enabled };
}
