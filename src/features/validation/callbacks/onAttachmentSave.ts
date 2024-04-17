import { useCallback } from 'react';

import { getVisibilityMask } from 'src/features/validation/utils';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Sets attachment validations as visible for when an attachment is saved (tag is changed).
 */
export function useOnAttachmentSave() {
  const setAttachmentVisibility = NodesInternal.useSetAttachmentVisibility();

  return useCallback(
    (node: LayoutNode, attachmentId: string) => {
      const mask = getVisibilityMask(['All']);
      setAttachmentVisibility(attachmentId, node, mask);
    },
    [setAttachmentVisibility],
  );
}
