import React, { useMemo, useRef } from 'react';

import { useNodeValidation } from 'src/features/validation/nodeValidation/useNodeValidation';
import { getInitialMaskFromNode } from 'src/features/validation/utils';
import { NodesStateQueue } from 'src/utils/layout/generator/CommitQueue';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { GeneratorCondition, StageFormValidation } from 'src/utils/layout/generator/GeneratorStages';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { CompCategory } from 'src/layout/common';
import type { TypesFromCategory } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function StoreValidationsInNode() {
  return (
    <GeneratorCondition
      stage={StageFormValidation}
      mustBeAdded='parent'
    >
      <StoreValidationsInNodeWorker />
    </GeneratorCondition>
  );
}

function StoreValidationsInNodeWorker() {
  const item = GeneratorInternal.useIntermediateItem()!;
  const node = GeneratorInternal.useParent() as LayoutNode<
    TypesFromCategory<CompCategory.Form | CompCategory.Container>
  >;

  const shouldValidate = useMemo(
    () => item !== undefined && !('renderAsSummary' in item && item.renderAsSummary),
    [item],
  );

  const validations = useNodeValidation(node, shouldValidate);

  const hasBeenSet = NodesInternal.useNodeData(node, (data) => data.validations === validations);
  NodesStateQueue.useSetNodeProp({ node, prop: 'validations', value: validations }, !hasBeenSet && shouldValidate);

  const initialMask = getInitialMaskFromNode('showValidations' in item ? item.showValidations : undefined);
  const isInitialRender = useRef(true);
  NodesStateQueue.useSetNodeProp({ node, prop: 'validationVisibility', value: initialMask }, isInitialRender.current);
  isInitialRender.current = false;

  return null;
}
