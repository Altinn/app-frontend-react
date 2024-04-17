import { useEffect } from 'react';

import { useNodeValidation } from 'src/features/validation/nodeValidation/useNodeValidation';
import { getInitialMaskFromNode } from 'src/features/validation/utils';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { NodeGeneratorInternal } from 'src/utils/layout/NodesGeneratorContext';
import type { CompCategory } from 'src/layout/common';
import type { TypesFromCategory } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function StoreValidationsInNode() {
  const node = NodeGeneratorInternal.useParent() as LayoutNode<
    TypesFromCategory<CompCategory.Form | CompCategory.Container>
  >;
  const validations = useNodeValidation(node);
  const setNodeProp = NodesInternal.useSetNodeProp();

  useEffect(() => {
    setNodeProp(node, 'validations', validations);
  }, [node, setNodeProp, validations]);

  const initialMask = getInitialMaskFromNode(node);
  useEffect(() => {
    setNodeProp(node, 'validationVisibility', initialMask);
  }, [initialMask, node, setNodeProp]);

  return null;
}
