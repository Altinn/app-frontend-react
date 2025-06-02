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
  const groupFieldCharacters = groupBinding ? groupBinding.field.length + 1 : 0;

  const checkedPath = bindings.checked?.field?.substring(groupFieldCharacters);
  const valuePath = bindings.simpleBinding?.field?.substring(groupFieldCharacters);
  const labelPath = bindings.label?.field?.substring(groupFieldCharacters);

  const selectedRows = useMemo(
    () =>
      groupRows
        ?.map((row, i) => {
          const optionForRow = options.find((option) =>
            valuePath ? dot.pick(valuePath, row)?.toString() === option.value : false,
          );
          return {
            data: row,
            index: i,
            label: optionForRow?.label,
            translatedLabel: optionForRow?.label ? langAsString(optionForRow.label) : undefined,
          };
        })
        .filter((row) => (checkedPath ? dot.pick(checkedPath, row.data) : false)),
    [langAsString, options, checkedPath, groupRows, valuePath],
  );

  const translatedLabels = selectedRows
    ?.map((row) => row.translatedLabel)
    .filter((translatedLabel) => translatedLabel !== undefined);

  const formDataLabels: string[] = [];
  groupRows?.forEach((row) => {
    const labelValue = labelPath ? dot.pick(labelPath, row) : undefined;
    if (labelValue) {
      formDataLabels.push(labelValue);
    }
  });
  const labelsHaveChanged = !deepEqual(translatedLabels, formDataLabels);
  const shouldSetData = labelsHaveChanged && !isNodeHidden && bindings && 'label' in bindings;

  NodesInternal.useEffectWhenReady(() => {
    if (!shouldSetData) {
      return;
    }
    if (translatedLabels && translatedLabels.length > 0) {
      selectedRows?.forEach(({ index, translatedLabel }) => {
        if (bindings.group && bindings.label) {
          const field = `${bindings.group.field}[${index}].${labelPath}`;
          setLeafValue({ reference: { ...bindings.label, field }, newValue: translatedLabel });
        }
      });
    }
  }, [setValue, shouldSetData, translatedLabels, valueType]);

  return null;
}
