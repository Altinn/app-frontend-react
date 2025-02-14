import { useEffect, useRef, useState } from 'react';

import { useSetOptions } from 'src/features/options/useGetOptions';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { Hidden, NodesInternal, NodesReadiness } from 'src/utils/layout/NodesContext';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { OptionsValueType } from 'src/features/options/useGetOptions';
import type { IDataModelBindingsOptionsSimple } from 'src/layout/common.generated';
import type { CompIntermediate, CompWithBehavior } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface Props {
  valueType: OptionsValueType;
  preselectedOption: IOptionInternal | undefined;
  options: IOptionInternal[];
}

/**
 * If given the 'preselectedOptionIndex' property, we should automatically select the given option index as soon
 * as options are ready. The code is complex to guard against overwriting data that has been set by the user.
 */
export function EffectPreselectedOptionIndex({ preselectedOption, valueType, options }: Props) {
  const node = GeneratorInternal.useParent() as LayoutNode<CompWithBehavior<'canHaveOptions'>>;
  const nodeStore = NodesInternal.useStore();
  const [_, setForceUpdate] = useState(0);
  const isNodeHidden = Hidden.useIsHidden(node);
  const hasSelectedInitial = useRef(false);
  const item = GeneratorInternal.useIntermediateItem() as CompIntermediate<CompWithBehavior<'canHaveOptions'>>;
  const dataModelBindings = item.dataModelBindings as IDataModelBindingsOptionsSimple | undefined;
  const { unsafeSelectedValues, setData } = useSetOptions(valueType, dataModelBindings, options);
  const hasValue = unsafeSelectedValues.length > 0;
  const shouldSelectOptionAutomatically =
    !hasValue && !hasSelectedInitial.current && preselectedOption !== undefined && isNodeHidden !== true;

  useEffect(() => {
    if (shouldSelectOptionAutomatically) {
      if (nodeStore.getState().readiness !== NodesReadiness.Ready) {
        requestAnimationFrame(() => setForceUpdate((prev) => prev + 1));
        return;
      }

      setData([preselectedOption.value]);
      hasSelectedInitial.current = true;
    }
  }, [preselectedOption, shouldSelectOptionAutomatically, setData, nodeStore]);

  return null;
}
