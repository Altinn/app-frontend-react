import { useMemo } from 'react';

import dot from 'dot-object';
import deepEqual from 'fast-deep-equal';

import { FD } from 'src/features/formData/FormDataWrite';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { OptionsValueType } from 'src/features/options/useGetOptions';
import type { IDataModelBindingsForGroupCheckbox } from 'src/layout/Checkboxes/config.generated';
import type { CompIntermediate, CompWithBehavior } from 'src/layout/layout';
import type { IDataModelBindingsForGroupMultiselect } from 'src/layout/MultipleSelect/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type Row = Record<string, unknown>;

interface Props {
  valueType: OptionsValueType;
  options: IOptionInternal[];
}

/**
 * This effect is responsible for setting the label/display value in the data model.
 */
export function EffectStoreLabelInGroup({ valueType, options }: Props) {
  const item = GeneratorInternal.useIntermediateItem() as CompIntermediate<CompWithBehavior<'canHaveOptions'>>;
  const node = GeneratorInternal.useParent() as LayoutNode<CompWithBehavior<'canHaveOptions'>>;
  const isNodeHidden = Hidden.useIsHidden(node);
  const { langAsString } = useLanguage();
  const formDataSelector = FD.useCurrentSelector();
  const setLeafValue = FD.useSetLeafValue();

  const bindings = item.dataModelBindings as IDataModelBindingsForGroupCheckbox | IDataModelBindingsForGroupMultiselect;

  const { setValue } = useDataModelBindings(bindings);

  const groupBinding = bindings.group;
  const groupRows = groupBinding ? (formDataSelector(groupBinding) as Row[]) : undefined;
  const fieldOffset = groupBinding?.field.length ? groupBinding.field.length + 1 : 0;

  const extractPath = (bindingField?: { field: string }) => bindingField?.field?.substring(fieldOffset);

  const checkedPath = extractPath(bindings.checked);
  const valuePath = extractPath(bindings.simpleBinding);
  const labelPath = extractPath(bindings.label);

  const selectedRows = useMemo(
    () =>
      groupRows
        ?.map((row, index) => {
          const value = valuePath ? dot.pick(valuePath, row)?.toString() : undefined;
          const matchedOption = options.find((option) => option.value === value);
          const translatedLabel = matchedOption?.label ? langAsString(matchedOption.label) : undefined;
          const isChecked = checkedPath ? dot.pick(checkedPath, row) : false;

          return isChecked ? { index, data: row, translatedLabel } : null;
        })
        .filter((row): row is Exclude<typeof row, null> => row !== null),
    [groupRows, options, checkedPath, valuePath, langAsString],
  );

  const translatedLabels = selectedRows?.map((row) => row.translatedLabel).filter(Boolean);

  const formDataLabels = groupRows
    ?.map((row) => (labelPath ? dot.pick(labelPath, row) : undefined))
    .filter((label): label is string => Boolean(label));

  const shouldUpdate = !deepEqual(translatedLabels, formDataLabels) && !isNodeHidden && 'label' in bindings;

  NodesInternal.useEffectWhenReady(() => {
    if (!shouldUpdate || !translatedLabels?.length) {
      return;
    }

    selectedRows?.forEach(({ index, translatedLabel }) => {
      if (bindings.group && bindings.label && translatedLabel) {
        const field = `${bindings.group.field}[${index}].${labelPath}`;
        setLeafValue({ reference: { ...bindings.label, field }, newValue: translatedLabel });
      }
    });
  }, [setValue, shouldUpdate, translatedLabels, valueType]);

  return null;
}
