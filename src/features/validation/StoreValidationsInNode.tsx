import { useEffect, useMemo } from 'react';

import { useNodeValidation } from 'src/features/validation/nodeValidation/useNodeValidation';
import { getInitialMaskFromNode } from 'src/features/validation/utils';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import { NodeGeneratorInternal } from 'src/utils/layout/NodesGeneratorContext';
import type { CompCategory } from 'src/layout/common';
import type { TypesFromCategory } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function StoreValidationsInNode() {
  const item = NodeGeneratorInternal.useItem();
  const node = NodeGeneratorInternal.useParent() as LayoutNode<
    TypesFromCategory<CompCategory.Form | CompCategory.Container>
  >;
  const setNodeProp = NodesInternal.useSetNodeProp();
  const isAdded = NodesInternal.useIsAdded(node);
  const isHidden = Hidden.useIsHiddenSelector();

  const shouldValidate = useMemo(
    () =>
      isAdded &&
      item !== undefined &&
      !isHidden({ node, options: { respectTracks: true } }) &&
      !('renderAsSummary' in item && item.renderAsSummary),
    [isAdded, isHidden, item, node],
  );

  const validations = useNodeValidation(node, shouldValidate);

  useEffect(() => {
    isAdded && setNodeProp(node, 'validations', validations);
  }, [isAdded, node, setNodeProp, validations]);

  const initialMask = item ? getInitialMaskFromNode(item) : undefined;
  useEffect(() => {
    isAdded && initialMask !== undefined && setNodeProp(node, 'validationVisibility', initialMask);
  }, [isAdded, initialMask, node, setNodeProp]);

  return null;
}
