import React, { useMemo, useRef } from 'react';

import deepEqual from 'fast-deep-equal';

import { useNodeValidation } from 'src/features/validation/nodeValidation/useNodeValidation';
import { getInitialMaskFromNode } from 'src/features/validation/utils';
import { NodesStateQueue } from 'src/utils/layout/generator/CommitQueue';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { GeneratorCondition, StageFormValidation } from 'src/utils/layout/generator/GeneratorStages';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { AnyValidation, AttachmentValidation } from 'src/features/validation/index';
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

type Node = LayoutNode<TypesFromCategory<CompCategory.Form | CompCategory.Container>>;

function StoreValidationsInNodeWorker() {
  const item = GeneratorInternal.useIntermediateItem()!;
  const node = GeneratorInternal.useParent() as Node;

  const shouldValidate = useMemo(
    () => item !== undefined && !('renderAsSummary' in item && item.renderAsSummary),
    [item],
  );

  const freshValidations = useNodeValidation(node, shouldValidate);
  const validations = useUpdatedValidations(freshValidations, node);

  const hasBeenSet = NodesInternal.useNodeData(node, (data) => deepEqual(data.validations, validations));
  NodesStateQueue.useSetNodeProp({ node, prop: 'validations', value: validations }, !hasBeenSet && shouldValidate);

  const initialMask = getInitialMaskFromNode('showValidations' in item ? item.showValidations : undefined);
  const isInitialRender = useRef(true);
  NodesStateQueue.useSetNodeProp({ node, prop: 'validationVisibility', value: initialMask }, isInitialRender.current);
  isInitialRender.current = false;

  return null;
}

function useUpdatedValidations(validations: AnyValidation[], node: Node) {
  return NodesInternal.useNodeData(node, (data) => {
    if (!data.validations) {
      return validations;
    }

    const copy = [...validations];
    for (const [idx, validation] of copy.entries()) {
      if (!('attachmentId' in validation)) {
        continue;
      }
      // Preserve the visibility of existing attachment validations
      const existing = data.validations.find(
        (v) => 'attachmentId' in v && v.attachmentId === validation.attachmentId,
      ) as AttachmentValidation;
      if (existing) {
        copy[idx] = { ...validation, visibility: existing.visibility };
      }
    }

    return copy;
  });
}
