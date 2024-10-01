import React, { useMemo } from 'react';

import { useNodeValidation } from 'src/features/validation/nodeValidation/useNodeValidation';
import { getInitialMaskFromNodeItem } from 'src/features/validation/utils';
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
      <PerformWork />
    </GeneratorCondition>
  );
}

function PerformWork() {
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
  const visibility = NodesInternal.useRawValidationVisibility(node);

  const initialMask = item ? getInitialMaskFromNodeItem(item) : undefined;

  // Update validations
  GeneratorStages.FormValidation.useEffect(() => {
    setNodeProp({ node, prop: 'validations', value: validations });

    // Reduce visibility as validations are fixed
    if (initialMask !== undefined) {
      const currentValidationMask = validations.reduce((mask, { category }) => mask | category, 0);
      const newVisibilityMask = currentValidationMask & visibility;
      if ((newVisibilityMask | initialMask) !== visibility) {
        setNodeProp({ node, prop: 'validationVisibility', value: newVisibilityMask });
      }
    }
  }, [node, setNodeProp, validations]);

  // Set initial visibility
  GeneratorStages.FormValidation.useConditionalEffect(() => {
    if (initialMask !== undefined) {
      setNodeProp({ node, prop: 'validationVisibility', value: initialMask });
      return true;
    }
    return false;
  }, [initialMask, node, setNodeProp]);

  return null;
}
