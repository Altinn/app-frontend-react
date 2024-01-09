import { useCallback } from 'react';

import { getVisibilityMask } from 'src/features/validation/utils';
import { useValidationContext } from 'src/features/validation/validationProvider';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useOnAttachmentSave() {
  const setAttachmentVisibility = useValidationContext().setAttachmentVisibility;

  return useCallback(
    (node: LayoutNode, attachmentId: string) => {
      const mask = getVisibilityMask(['Component']);
      setAttachmentVisibility(attachmentId, node, mask);
    },
    [setAttachmentVisibility],
  );
}
