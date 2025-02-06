import { useMemo } from 'react';

import { ContextNotProvided } from 'src/core/contexts/context';
import { usePageGroups, usePageSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useGetAltinnTaskType } from 'src/features/instance/ProcessContext';
import { ValidationMask } from 'src/features/validation';
import { useVisitedPages } from 'src/hooks/useNavigatePage';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import { useLaxNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';
import type { NavigationReceipt, NavigationTask } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function useHasGroupedNavigation() {
  const pageGroups = usePageGroups();
  const taskGroups = usePageSettings().taskNavigation;
  return pageGroups || taskGroups.length;
}

export const SIDEBAR_BREAKPOINT = 1341;

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
 * 3. A page is marked as completed if there are no nodes with any validations errors (visible or not), and the user has clicked 'next'.
 *    Immediately marking a page as completed because it has no required nodes can be confusing, so these will never get marked.
 * 4. A group is marked as completed if any of its pages have no nodes with any validations errors (visible or not), and all of the pages are marked as 'visited'.
 */
export function useValidationsForPages(order: string[], shouldMarkWhenCompleted = false) {
  const traversalSelector = useLaxNodeTraversalSelector();
  const validationsSelector = NodesInternal.useLaxValidationsSelector();
  const [visitedPages] = useVisitedPages();

  const allNodes = traversalSelector(
    (traverser) =>
      order.reduce<Record<string, LayoutNode[]>>((allNodes, pageId) => {
        allNodes[pageId] = traverser.findPage(pageId)?.flat() ?? [];
        return allNodes;
      }, {}),
    [order],
  );

  const isCompleted = useMemo(() => {
    if (allNodes === ContextNotProvided) {
      return ContextNotProvided;
    }

    if (!shouldMarkWhenCompleted) {
      return { group: false, pages: Object.fromEntries(order.map((page) => [page, false])) };
    }

    const pageHasNoErrors = Object.fromEntries(
      order.map((page) => [
        page,
        allNodes[page].every((node) => {
          const allValidations = validationsSelector(node, ValidationMask.All, 'error');
          return allValidations !== ContextNotProvided && allValidations.length === 0;
        }),
      ]),
    );

    const completedPages = Object.fromEntries(
      order.map((page) => [page, pageHasNoErrors[page] && visitedPages.includes(page)]),
    );

    const groupIsComplete = order.every((page) => pageHasNoErrors[page] && visitedPages.includes(page));

    return { pages: completedPages, group: groupIsComplete };
  }, [order, allNodes, validationsSelector, shouldMarkWhenCompleted, visitedPages]);

  const hasErrors = useMemo(() => {
    if (allNodes === ContextNotProvided) {
      return ContextNotProvided;
    }

    const pageHasErrors = Object.fromEntries(
      order.map((page) => [
        page,
        allNodes[page].some((node) => {
          const visibleValidations = validationsSelector(node, 'visible', 'error');
          return visibleValidations !== ContextNotProvided && visibleValidations.length > 0;
        }),
      ]),
    );

    const groupHasErrors = Object.values(pageHasErrors).some((p) => p);

    return { pages: pageHasErrors, group: groupHasErrors };
  }, [order, allNodes, validationsSelector]);

  if (isCompleted === ContextNotProvided || hasErrors === ContextNotProvided) {
    return ContextNotProvided;
  }

  return { isCompleted, hasErrors };
}
