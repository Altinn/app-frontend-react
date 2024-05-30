import React from 'react';

import { useFetchOptions } from 'src/features/options/useGetOptions';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { GeneratorCondition, GeneratorStages, StageFetchOptions } from 'src/utils/layout/generator/GeneratorStages';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { OptionsValueType } from 'src/features/options/useGetOptions';
import type { CompIntermediate, CompWithBehavior } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface Props {
  valueType: OptionsValueType;
}

export function StoreOptionsInNode(props: Props) {
  return (
    <GeneratorCondition
      stage={StageFetchOptions}
      mustBeAdded='parent'
    >
      <PerformWork {...props} />
    </GeneratorCondition>
  );
}

function PerformWork({ valueType }: Props) {
  const item = GeneratorInternal.useIntermediateItem() as CompIntermediate<CompWithBehavior<'canHaveOptions'>>;
  const node = GeneratorInternal.useParent() as LayoutNode<CompWithBehavior<'canHaveOptions'>>;
  const setNodeProp = NodesInternal.useSetNodeProp();

  const { options, isFetching } = useFetchOptions({
    valueType,
    node,
    item,
  });

  GeneratorStages.FetchOptions.useEffect(() => {
    !isFetching && setNodeProp(node, 'options' as any, options);
    setNodeProp(node, 'isFetchingOptions' as any, isFetching);
  }, [node, setNodeProp, options]);

  return null;
}
