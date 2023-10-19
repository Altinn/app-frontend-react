import { useMemo } from 'react';

import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useExprContext } from 'src/utils/layout/ExprContext';
import type { IAttachments } from 'src/features/attachments';
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
      uploaded: true,

      // PRIORITY: These things needs to be stateful and could change at any time
      deleting: false,
      updating: false,
      error: undefined,

      data,
    });
  }

  return attachments;
}

export function useMappedAttachments() {
  const data = useLaxInstanceData()?.data;
  const nodes = useExprContext();

  return useMemo(() => {
    if (data && nodes) {
      return mapAttachments(data, nodes);
    }

    return {};
  }, [data, nodes]);
}
