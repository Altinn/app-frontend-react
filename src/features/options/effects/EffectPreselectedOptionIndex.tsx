import { useEffect, useRef } from 'react';

import { useGetOptionsUsingDmb } from 'src/features/options/useGetOptions';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { GeneratorOptionProps } from 'src/features/options/StoreOptionsInNode';
import type { IDataModelBindingsOptionsSimple } from 'src/layout/common.generated';
import type { CompIntermediate, CompWithBehavior } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * If given the 'preselectedOptionIndex' property, we should automatically select the given option index as soon
 * as options are ready. The code is complex to guard against overwriting data that has been set by the user.
 */
export function EffectPreselectedOptionIndex({
  preselectedOption,
  valueType,
}: {
  preselectedOption: IOptionInternal | undefined;
} & GeneratorOptionProps) {
  const node = GeneratorInternal.useParent() as LayoutNode<CompWithBehavior<'canHaveOptions'>>;
  const isNodeHidden = Hidden.useIsHidden(node);
  const isNodesReady = NodesInternal.useIsReady();
  const hasSelectedInitial = useRef(false);
  const item = GeneratorInternal.useIntermediateItem() as CompIntermediate<CompWithBehavior<'canHaveOptions'>>;
  const dataModelBindings = item.dataModelBindings as IDataModelBindingsOptionsSimple | undefined;
  const { unsafeSelectedValues, setData } = useGetOptionsUsingDmb(node, valueType, dataModelBindings);
  const hasValue = unsafeSelectedValues.length > 0;
  const shouldSelectOptionAutomatically =
    !hasValue &&
    !hasSelectedInitial.current &&
    preselectedOption !== undefined &&
    isNodesReady &&
    isNodeHidden !== true;

  useEffect(() => {
    if (shouldSelectOptionAutomatically) {
      setData([preselectedOption.value]);
      hasSelectedInitial.current = true;
    }
  }, [preselectedOption, shouldSelectOptionAutomatically, setData]);

  return null;
}
