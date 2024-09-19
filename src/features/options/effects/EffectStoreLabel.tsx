import { useEffect, useMemo } from 'react';

import deepEqual from 'fast-deep-equal';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptionsUsingDmb } from 'src/features/options/useGetOptions';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import type { GeneratorOptionProps } from 'src/features/options/StoreOptionsInNode';
import type { IDataModelBindingsOptionsSimple } from 'src/layout/common.generated';
import type { CompIntermediate, CompWithBehavior } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * This effect is responsible for setting the label/display value in the data model.
 */
export function EffectStoreLabel({ valueType }: GeneratorOptionProps) {
  const item = GeneratorInternal.useIntermediateItem() as CompIntermediate<CompWithBehavior<'canHaveOptions'>>;
  const node = GeneratorInternal.useParent() as LayoutNode<CompWithBehavior<'canHaveOptions'>>;
  const isNodeHidden = Hidden.useIsHidden(node);
  const isNodesReady = NodesInternal.useIsReady();
  const { langAsString } = useLanguage();
  const dataModelBindings = item.dataModelBindings as IDataModelBindingsOptionsSimple | undefined;
  const { formData, setValue } = useDataModelBindings(dataModelBindings);
  const { options, unsafeSelectedValues } = useGetOptionsUsingDmb(node, valueType, dataModelBindings);

  const translatedLabels = useMemo(
    () =>
      options
        ?.filter((option) => unsafeSelectedValues.includes(option.value))
        .map((option) => option.label)
        .map((label) => langAsString(label)),
    [langAsString, options, unsafeSelectedValues],
  );

  const labelsHaveChanged = !deepEqual(translatedLabels, 'label' in formData ? formData.label : undefined);
  const shouldSetData =
    labelsHaveChanged && !isNodeHidden && isNodesReady && dataModelBindings && 'label' in dataModelBindings;

  useEffect(() => {
    if (!shouldSetData) {
      return;
    }

    if (!translatedLabels || translatedLabels.length === 0) {
      setValue('label', undefined);
      return;
    } else if (valueType === 'single') {
      setValue('label', translatedLabels.at(0));
    } else {
      setValue('label', translatedLabels);
    }
  }, [setValue, shouldSetData, translatedLabels, valueType]);

  return null;
}
