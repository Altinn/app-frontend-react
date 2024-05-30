import React, { useMemo } from 'react';

import { useNodeValidation } from 'src/features/validation/nodeValidation/useNodeValidation';
import { getInitialMaskFromNode } from 'src/features/validation/utils';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { GeneratorCondition, GeneratorStages, StageFormValidation } from 'src/utils/layout/generator/GeneratorStages';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import type { CompCategory } from 'src/layout/common';
import type { TypesFromCategory } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { IsHiddenOptions } from 'src/utils/layout/NodesContext';

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

const isHiddenOptions: IsHiddenOptions = { respectTracks: true };

function PerformWork() {
  const item = GeneratorInternal.useIntermediateItem();
  const node = GeneratorInternal.useParent() as LayoutNode<
    TypesFromCategory<CompCategory.Form | CompCategory.Container>
  >;
  const setNodeProp = NodesInternal.useSetNodeProp();
  const isHidden = Hidden.useIsHiddenSelector();

  const shouldValidate = useMemo(
    () =>
      item !== undefined &&
      !isHidden({ node, options: isHiddenOptions }) &&
      !('renderAsSummary' in item && item.renderAsSummary),
    [isHidden, item, node],
  );

  const validations = useNodeValidation(node, shouldValidate);
  GeneratorStages.FormValidation.useEffect(() => {
    setNodeProp(node, 'validations', validations);
  }, [node, setNodeProp, validations]);

  const initialMask = item
    ? getInitialMaskFromNode('showValidations' in item ? item.showValidations : undefined)
    : undefined;

  GeneratorStages.FormValidation.useConditionalEffect(() => {
    if (initialMask !== undefined) {
      setNodeProp(node, 'validationVisibility', initialMask);
      return true;
    }
    return false;
  }, [initialMask, node, setNodeProp]);

  return null;
}
