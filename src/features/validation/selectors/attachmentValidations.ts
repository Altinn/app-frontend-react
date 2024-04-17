import { useMemo } from 'react';

import type { AttachmentValidation, NodeValidation } from '..';

import { filterValidations, selectValidations } from 'src/features/validation/utils';
import { getResolvedVisibilityForAttachment } from 'src/features/validation/visibility/visibilityUtils';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { AttachmentsPlugin } from 'src/features/attachments/AttachmentsPlugin';
import type { ValidationPlugin } from 'src/features/validation/ValidationPlugin';
import type { CompWithPlugin } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ValidTypes = CompWithPlugin<AttachmentsPlugin> & CompWithPlugin<ValidationPlugin>;

/**
 * Returns the validations for the given attachment.
 */
export function useAttachmentValidations(
  node: LayoutNode<ValidTypes>,
  attachmentId: string | undefined,
): NodeValidation<AttachmentValidation>[] {
  const visibility = NodesInternal.useValidationVisibility(node);
  const validations = NodesInternal.useValidations(node);

  return useMemo(() => {
    if (!attachmentId) {
      return [];
    }
    const validation = validations.filter(
      (v) => 'attachmentId' in v && v.attachmentId === attachmentId,
    ) as AttachmentValidation[];

    const output = filterValidations(
      selectValidations(validation, getResolvedVisibilityForAttachment(validation[0]?.visibility, visibility)),
      node,
    );
    return output.map((validation) => ({ ...validation, node }));
  }, [attachmentId, node, validations, visibility]);
}
