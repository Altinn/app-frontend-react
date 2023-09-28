import { useMemo } from 'react';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { useExprContext } from 'src/utils/layout/ExprContext';
import type { IAttachment, IAttachments } from 'src/features/attachments';
import type { IData } from 'src/types/shared';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

export function mapAttachments(dataElements: IData[], nodes: LayoutPages): IAttachments {
  const attachments: IAttachments = {};

  for (const data of dataElements) {
    const node = nodes.findById(data.dataType);
    if (!node) {
      continue;
    }

    if (!attachments[node.item.id]) {
      attachments[node.item.id] = [];
    }
    attachments[node.item.id]?.push({
      state: 'uploaded',
      data,
    });
  }

  // Sort all attachments by name
  for (const attachmentComponentId in attachments) {
    attachments[attachmentComponentId]?.sort(sortAttachmentsByName);
  }

  return attachments;
}

function sortAttachmentsByName(a: IAttachment, b: IAttachment) {
  if (a.data.filename && b.data.filename) {
    return a.data.filename.localeCompare(b.data.filename);
  }
  return 0;
}

export function useMappedAttachments() {
  const data = useAppSelector((state) => state.instanceData.instance?.data);
  const nodes = useExprContext();

  return useMemo(() => {
    if (data && nodes) {
      return mapAttachments(data, nodes);
    }

    return {};
  }, [data, nodes]);
}
