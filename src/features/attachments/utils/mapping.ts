import { useMemo } from 'react';

import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useExprContext } from 'src/utils/layout/ExprContext';
import type { IData } from 'src/types/shared';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

export interface SimpleAttachments {
  [attachmentComponentId: string]: IData[] | undefined;
}

function mapAttachments(dataElements: IData[], nodes: LayoutPages): SimpleAttachments {
  const attachments: SimpleAttachments = {};

  for (const data of dataElements) {
    const matchingNodes = nodes.findAllById(data.dataType);
    if (!matchingNodes.length) {
      continue;
    }

    if (matchingNodes.length === 1) {
      const node = matchingNodes[0];
      if (!attachments[node.item.id]) {
        attachments[node.item.id] = [];
      }
      attachments[node.item.id]?.push(data);
      continue;
    }

    // If there are multiple matching nodes, we need to find the one that has formData matching the attachment ID.
    for (const node of matchingNodes) {
      const formData = node.getFormData();
      const _simpleBinding = 'simpleBinding' in formData ? formData.simpleBinding : undefined;
      const _listBInding = 'list' in formData ? formData.list : undefined;

      throw new Error('Not implemented');
    }
  }

  return attachments;
}

/**
 * This hook will map all attachments in the instance data to the nodes in the layout.
 * It will however, not do anything with new attachments that are not yet uploaded as of loading the instance data.
 * Use the `useAttachments` hook for that.
 *
 * @see useAttachments
 */
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
