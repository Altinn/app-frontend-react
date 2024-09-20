import React, { useMemo } from 'react';

import { useNodeValidation } from 'src/features/validation/nodeValidation/useNodeValidation';
import { getInitialMaskFromNode } from 'src/features/validation/utils';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import {
  GeneratorCondition,
  GeneratorStages,
  NodesStateQueue,
  StageFormValidation,
} from 'src/utils/layout/generator/GeneratorStages';
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
  const item = GeneratorInternal.useIntermediateItem();
  const node = GeneratorInternal.useParent() as LayoutNode<
    TypesFromCategory<CompCategory.Form | CompCategory.Container>
  >;
  const setNodeProp = NodesStateQueue.useSetNodeProp();

  const shouldValidate = useMemo(
    () => item !== undefined && !('renderAsSummary' in item && item.renderAsSummary),
    [item],
  );

  const validations = useNodeValidation(node, shouldValidate);

  const hasBeenSet = NodesInternal.useNodeData(node, (data) => data.validations === validations);
  if (!hasBeenSet && shouldValidate) {
    setNodeProp({ node, prop: 'validations', value: validations });
  }

  const initialMask = item
    ? getInitialMaskFromNode('showValidations' in item ? item.showValidations : undefined)
    : undefined;

  // This still has to be done in the effect, as the initialMask should only
  // be set initially, not every time the component re-renders
  GeneratorStages.FormValidation.useConditionalEffect(() => {
    if (initialMask !== undefined) {
      setNodeProp({ node, prop: 'validationVisibility', value: initialMask });
      return true;
    }
    return false;
  }, [initialMask, node, setNodeProp]);

  return null;
}
