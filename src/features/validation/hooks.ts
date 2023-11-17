import { useEffect, useRef } from 'react';

import deepEqual from 'fast-deep-equal';

import { useAttachments } from 'src/features/attachments/AttachmentsContext';
import { useExprContext } from 'src/utils/layout/ExprContext';
import type { IAttachment, IAttachments } from 'src/features/attachments';
import type { IFormData } from 'src/features/formData';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
/**
 * Provides a callback function with added/removed nodes when the hierarchy changes
 */
export function useOnHierarchyChange(
  onChange: (addedNodeChanges: NodeDataChange[], removedNodes: LayoutNode[], currentNodes: LayoutNode[]) => void,
) {
  const layoutNodes = useExprContext();
  const lastNodes = useRef<LayoutNode[]>([]);

  useEffect(() => {
    const prevNodes = lastNodes.current;
    const newNodes = layoutNodes?.allNodes() ?? [];
    if (
      !deepEqual(
        prevNodes.map((n) => n.item.id),
        newNodes.map((n) => n.item.id),
      )
    ) {
      lastNodes.current = newNodes;

      const addedNodes = newNodes
        .filter((n) => !prevNodes.find((pn) => pn.item.id === n.item.id))
        .map((n) => ({
          node: n,
          fields: n.item.dataModelBindings ? Object.values(n.item.dataModelBindings) : [],
        }));
      const removedNodes = prevNodes.filter((pn) => !newNodes.find((n) => pn.item.id === n.item.id));
      onChange(addedNodes, removedNodes, newNodes);
    }
  }, [layoutNodes, onChange]);
}

export type NodeDataChange = {
  node: LayoutNode;
  fields: string[];
};
/**
 * Provides a callback function with a list of nodes whoes data has changed
 */
export function useOnNodeDataChange(onChange: (nodeChanges: NodeDataChange[]) => void) {
  const layoutNodes = useExprContext();
  const lastNodeData = useRef<{ [id: string]: LayoutNode }>({});

  useEffect(() => {
    const prevNodes = lastNodeData.current;
    const newNodes: { [id: string]: LayoutNode } =
      layoutNodes?.allNodes().reduce((data, node) => ({ ...data, [node.item.id]: node }), {}) ?? {};

    // Update if nodes have been added or removed
    let shouldUpdate = !deepEqual(Object.keys(newNodes), Object.keys(prevNodes));

    const updatedNodes: NodeDataChange[] = [];
    for (const [id, newNode] of Object.entries(newNodes)) {
      const prevNode = prevNodes[id];
      if (!prevNode) {
        continue;
      }
      const changes = getChangedFields(newNode.getFieldFormData(), prevNode.getFieldFormData());
      if (changes.length) {
        shouldUpdate = true;
        updatedNodes.push({
          node: newNode,
          fields: changes,
        });
      }
    }
    if (shouldUpdate) {
      lastNodeData.current = newNodes;
    }
    if (updatedNodes.length) {
      onChange(updatedNodes);
    }
  }, [layoutNodes, onChange]);
}

function getChangedFields(current: IFormData, prev: IFormData) {
  const changes: string[] = [];
  for (const field of Object.keys(current)) {
    if (current[field] !== prev[field]) {
      changes.push(field);
    }
  }
  for (const field of Object.keys(prev)) {
    if (!(field in current)) {
      changes.push(field);
    }
  }

  return changes;
}

export function useOnAttachmentsChange(onChange: (changedNodes: LayoutNode[]) => void) {
  const layoutNodes = useExprContext();
  const attachments = useAttachments();

  const lastAttachments = useRef<IAttachments>({});

  useEffect(() => {
    if (!layoutNodes) {
      return;
    }

    const prevAttachments = lastAttachments.current;
    const allAttachments = Object.values(attachments)
      .flat()
      .filter((a) => typeof a !== 'undefined') as IAttachment[];

    const settled = allAttachments.every((a) => a.uploaded && !a.deleting && !a.updating);

    if (settled) {
      const changedAttachments = getChangedAttachments(attachments, prevAttachments);
      if (changedAttachments.length) {
        lastAttachments.current = attachments;
        const changedNodes = layoutNodes.allNodes().filter((n) => changedAttachments.includes(n.item.id));
        onChange(changedNodes);
      }
    }
  }, [attachments, layoutNodes, onChange]);
}

function getChangedAttachments(current: IAttachments, prev: IAttachments) {
  const changes: string[] = [];
  for (const [componentId, attachments] of Object.entries(current)) {
    if (!prev[componentId]?.length && !attachments?.length) {
      // Special case that happens when adding the first attachment.
      // It goes from undefined to an empty array and we don't want to trigger a change twice
      continue;
    }
    if (!deepEqual(prev[componentId], attachments)) {
      changes.push(componentId);
    }
  }
  return changes;
}
