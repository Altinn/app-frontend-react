import { useMemo } from 'react';

import { useNodeValidation } from 'src/features/validation/nodeValidation/useNodeValidation';
import { getInitialMaskFromNode } from 'src/features/validation/utils';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import { NodeGeneratorInternal } from 'src/utils/layout/NodesGeneratorContext';
import { NodeStages } from 'src/utils/layout/NodeStages';
import type { CompCategory } from 'src/layout/common';
import type { TypesFromCategory } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function StoreValidationsInNode() {
  const item = NodeGeneratorInternal.useItem();
  const node = NodeGeneratorInternal.useParent() as LayoutNode<
    TypesFromCategory<CompCategory.Form | CompCategory.Container>
  >;
  const setNodeProp = NodesInternal.useSetNodeProp();
  const isAllAdded = NodeStages.AddNodes.useIsDone();
  const isSelfAdded = NodesInternal.useIsAdded(node);
  const isHidden = Hidden.useIsHiddenSelector();

  const shouldValidate = useMemo(
    () =>
      isAllAdded &&
      isSelfAdded &&
      item !== undefined &&
      !isHidden({ node, options: { respectTracks: true } }) &&
      !('renderAsSummary' in item && item.renderAsSummary),
    [isAllAdded, isSelfAdded, isHidden, item, node],
  );

  const validations = useNodeValidation(node, shouldValidate);
  NodeStages.EvaluateExpressions.useEffect(() => {
    isAllAdded && isSelfAdded && setNodeProp(node, 'validations', validations, 'ignore');
  }, [isAllAdded, isSelfAdded, node, setNodeProp, validations]);

  const initialMask = item
    ? getInitialMaskFromNode('showValidations' in item ? item.showValidations : undefined)
    : undefined;

  NodeStages.EvaluateExpressions.useEffect(() => {
    isAllAdded &&
      isSelfAdded &&
      initialMask !== undefined &&
      setNodeProp(node, 'validationVisibility', initialMask, 'ignore');
  }, [isAllAdded, isSelfAdded, initialMask, node, setNodeProp]);

  return null;
}
