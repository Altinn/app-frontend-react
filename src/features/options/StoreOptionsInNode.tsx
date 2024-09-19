import React from 'react';

import { EffectPreselectedOptionIndex } from 'src/features/options/effects/EffectPreselectedOptionIndex';
import { EffectRemoveStaleValues } from 'src/features/options/effects/EffectRemoveStaleValues';
import { EffectSetDownstreamParameters } from 'src/features/options/effects/EffectSetDownstreamParameters';
import { EffectStoreLabel } from 'src/features/options/effects/EffectStoreLabel';
import { useFetchOptions } from 'src/features/options/useGetOptions';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import {
  GeneratorCondition,
  GeneratorStages,
  NodesStateQueue,
  StageFetchOptions,
} from 'src/utils/layout/generator/GeneratorStages';
import type { OptionsValueType } from 'src/features/options/useGetOptions';
import type { CompIntermediate, CompWithBehavior } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface GeneratorOptionProps {
  valueType: OptionsValueType;
}

export function StoreOptionsInNode(props: GeneratorOptionProps) {
  return (
    <GeneratorCondition
      stage={StageFetchOptions}
      mustBeAdded='parent'
    >
      <StoreOptionsInNodeWorker {...props} />
    </GeneratorCondition>
  );
}

function StoreOptionsInNodeWorker({ valueType }: GeneratorOptionProps) {
  const item = GeneratorInternal.useIntermediateItem() as CompIntermediate<CompWithBehavior<'canHaveOptions'>>;
  const node = GeneratorInternal.useParent() as LayoutNode<CompWithBehavior<'canHaveOptions'>>;
  const setNodeProp = NodesStateQueue.useSetNodeProp();

  const { options, isFetching, preselectedOption, downstreamParameters } = useFetchOptions({
    valueType,
    node,
    item,
  });

  GeneratorStages.FetchOptions.useEffect(() => {
    !isFetching && setNodeProp({ node, prop: 'options', value: options });
    setNodeProp({ node, prop: 'isFetchingOptions', value: isFetching });
  }, [node, setNodeProp, options]);

  return (
    <>
      <EffectPreselectedOptionIndex
        preselectedOption={preselectedOption}
        valueType={valueType}
      />
      <EffectRemoveStaleValues valueType={valueType} />
      <EffectStoreLabel valueType={valueType} />
      <EffectSetDownstreamParameters downstreamParameters={downstreamParameters} />
    </>
  );
}
