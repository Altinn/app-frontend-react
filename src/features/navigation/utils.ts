import { useMemo } from 'react';

import { ContextNotProvided } from 'src/core/contexts/context';
import { usePageGroups, usePageSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useGetAltinnTaskType } from 'src/features/instance/ProcessContext';
import { ValidationMask } from 'src/features/validation';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import { useLaxNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';
import type { NavigationReceipt, NavigationTask } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeData } from 'src/utils/layout/types';

export function useHasGroupedNavigation() {
  const pageGroups = usePageGroups();
  const taskGroups = usePageSettings().taskNavigation;
  return pageGroups || taskGroups.length;
}

export const SIDEBAR_BREAKPOINT = 1450;

export function useVisiblePages(order: string[]) {
  const hiddenPages = Hidden.useHiddenPages();
  return useMemo(() => order.filter((page) => !hiddenPages.has(page)), [order, hiddenPages]);
}

export function useGetTaskGroupType() {
  const getTaskType = useGetAltinnTaskType();
  return (group: NavigationTask | NavigationReceipt) => ('taskId' in group ? getTaskType(group.taskId) : group.type);
}

/**
 * If no name is is given to the navigation task, a default name will be used instead.
 */
export function useGetTaskName() {
  const getTaskType = useGetTaskGroupType();

  return (group: NavigationTask | NavigationReceipt) => {
    if (group.name) {
      return group.name;
    }

    const type = getTaskType(group);
    if (!type) {
      if ('taskId' in group) {
        window.logErrorOnce(`Navigation component could not find a task with id '${group.taskId}'.`);
      }
      return '';
    }

    return `taskTypes.${type}`;
  };
}

/**
 * Returns the necessary information to mark states on a group and its pages.
 * Explanation on the current logic:
 * 1. A page is marked with error if any of its nodes have visible errors.
 * 2. A group is marked with error if any of its pages have nodes with visible errors.
 * 3. A page is marked as completed if it has at least one node with "required": true and no nodes with any validations errors (visible or not).
 *    Immediately marking a page as completed because it has no required nodes can be confusing, so these will never get marked.
 * 4. A group is marked as completed if any of its pages have nodes with "required": true, and no nodes with any validations errors (visible or not).
 *    Same logic goes here, if none of the nodes in any of its pages are required, it will never be marked as completed.
 *    It would be confusing since it would have to get marked as completed immediately in that case, so it stays neutral instead.
 *
 */
export function useValidationsForPages(order: string[]) {
  const traversalSelector = useLaxNodeTraversalSelector();
  const validationsSelector = NodesInternal.useLaxValidationsSelector();

  const pages = traversalSelector(
    (traverser) => {
      const allNodes: Record<string, LayoutNode[]> = {};
      const pageHasRequiredNodes: Record<string, boolean> = {};

      order.forEach((pageId) => {
        const page = traverser.findPage(pageId);

        allNodes[pageId] = page?.flat() ?? [];
        pageHasRequiredNodes[pageId] = page
          ? traverser.with(page).flat((n) => n.type === 'node' && nodeDataIsRequired(n)).length > 0
          : false;
      });

      return { allNodes, hasRequiredNodes: pageHasRequiredNodes };
    },
    [order],
  );

  const isCompleted = useMemo(() => {
    if (pages === ContextNotProvided) {
      return ContextNotProvided;
    }

    const pageHasNoErrors = Object.fromEntries(
      order.map((page) => [
        page,
        pages.allNodes[page].every((node) => {
          const allValidations = validationsSelector(node, ValidationMask.All, 'error');
          return allValidations !== ContextNotProvided && allValidations.length === 0;
        }),
      ]),
    );

    const completedPages = Object.fromEntries(
      order.map((page) => [page, pages.hasRequiredNodes[page] && pageHasNoErrors[page]]),
    );

    const groupIsComplete =
      order.some((page) => pages.hasRequiredNodes[page]) && order.every((page) => pageHasNoErrors[page]);

    return { pages: completedPages, group: groupIsComplete };
  }, [order, pages, validationsSelector]);

  const hasErrors = useMemo(() => {
    if (pages === ContextNotProvided) {
      return ContextNotProvided;
    }

    const pageHasErrors = Object.fromEntries(
      order.map((page) => [
        page,
        pages.allNodes[page].some((node) => {
          const visibleValidations = validationsSelector(node, 'visible', 'error');
          return visibleValidations !== ContextNotProvided && visibleValidations.length > 0;
        }),
      ]),
    );

    const groupHasErrors = Object.values(pageHasErrors).some((p) => p);

    return { pages: pageHasErrors, group: groupHasErrors };
  }, [order, pages, validationsSelector]);

  if (isCompleted === ContextNotProvided || hasErrors === ContextNotProvided) {
    return ContextNotProvided;
  }

  return { isCompleted, hasErrors };
}

/*
 * Returns whether or not a node is required to fill out.
 * This does not have to be the "required"-prop directly, some other props have the same effect
 * and produces validation messages with the same visibility, e.g. minCount, minNumberOfAttachments,
 * are the same as required in practice.
 */
function nodeDataIsRequired(n: NodeData) {
  const item = n.item;
  return !!(
    item &&
    // Component is required somehow
    (('required' in item && item.required) ||
      ('minCount' in item && item.minCount) ||
      ('minNumberOfAttachments' in item && item.minNumberOfAttachments)) &&
    // Component is not read only
    !('readOnly' in item && item.readOnly)
  );
}
