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
  const isHidden = Hidden.useIsHiddenSelector();

  const shouldValidate = useMemo(
    () =>
      isAllAdded &&
      item !== undefined &&
      !isHidden({ node, options: { respectTracks: true } }) &&
      !('renderAsSummary' in item && item.renderAsSummary),
    [isAllAdded, isHidden, item, node],
  );

  const validations = useNodeValidation(node, shouldValidate);
  NodeStages.EvaluateExpressions.useEffect(() => {
    isAllAdded && setNodeProp(node, 'validations', validations);
  }, [isAllAdded, node, setNodeProp, validations]);

  const initialMask = item ? getInitialMaskFromNode(item) : undefined;
  NodeStages.EvaluateExpressions.useEffect(() => {
    isAllAdded && initialMask !== undefined && setNodeProp(node, 'validationVisibility', initialMask);
  }, [isAllAdded, initialMask, node, setNodeProp]);

  return null;
}
