import { useCallback, useEffect, useInsertionEffect, useRef } from 'react';

import deepEqual from 'fast-deep-equal';

import { useAttachments } from 'src/features/attachments/AttachmentsContext';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { staticUseLanguageFromState } from 'src/hooks/useLanguage';
import { useExprContext } from 'src/utils/layout/ExprContext';
import type { IAttachment, IAttachments } from 'src/features/attachments';
import type { IFormData } from 'src/features/formData';
import type { IValidationContext, NodeDataChange, ValidationContextGenerator } from 'src/features/validation';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * Hook providing validation context generator
 */
export function useValidationContextGenerator(): ValidationContextGenerator {
  const formData = useAppSelector((state) => state.formData.formData);
  const attachments = useAttachments();
  const application = useAppSelector((state) => state.applicationMetadata.applicationMetadata);
  const instance = useLaxInstanceData() ?? null;
  const process = useLaxProcessData() ?? null;
  const layoutSets = useAppSelector((state) => state.formLayout.layoutsets);
  const schemas = useAppSelector((state) => state.formDataModel.schemas);
  const customValidation = useAppSelector((state) => state.customValidation.customValidation);
  const langToolsGenerator = useAppSelector(
    (state) => (node: LayoutNode | undefined) => staticUseLanguageFromState(state, node),
  );
  return useCallback(
    (node: LayoutNode | undefined): IValidationContext => ({
      formData,
      langTools: langToolsGenerator(node),
      attachments,
      application,
      instance,
      process,
      layoutSets,
      schemas,
      customValidation,
    }),
    [application, attachments, customValidation, formData, instance, langToolsGenerator, layoutSets, process, schemas],
  );
}

/**
 * This is a polyfill for the not yet released useEffectEvent hook,
 * use at your own risk :)
 * @see https://react.dev/learn/separating-events-from-effects#declaring-an-effect-event
 */
function useEffectEvent<T extends (...args: any[]) => void>(event: T) {
  const ref = useRef(event);
  useInsertionEffect(() => {
    ref.current = event;
  }, [event]);
  return useCallback((...args: Parameters<T>) => ref.current(...args), []);
}

/**
 * Provides a callback function with added/removed nodes when the hierarchy changes
 */
export function useOnHierarchyChange(
  onChange: (addedNodeChanges: NodeDataChange[], removedNodes: LayoutNode[], currentNodes: LayoutNode[]) => void,
) {
  const onChangeEvent = useEffectEvent(onChange);
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
      onChangeEvent(addedNodes, removedNodes, newNodes);
    }
  }, [layoutNodes, onChangeEvent]);
}

/**
 * Provides a callback function with a list of nodes whoes data has changed
 */
export function useOnNodeDataChange(onChange: (nodeChanges: NodeDataChange[]) => void) {
  const onChangeEvent = useEffectEvent(onChange);
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
      onChangeEvent(updatedNodes);
    }
  }, [layoutNodes, onChangeEvent]);
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
  const onChangeEvent = useEffectEvent(onChange);
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
        onChangeEvent(changedNodes);
      }
    }
  }, [attachments, layoutNodes, onChangeEvent]);
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
