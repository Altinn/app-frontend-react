import { useMemo } from 'react';

import type { Group } from '.';

import { ContextNotProvided } from 'src/core/contexts/context';
import { usePageGroups } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { ValidationMask } from 'src/features/validation';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useLaxNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeData } from 'src/utils/layout/types';

export function useHasGroupedNavigation() {
  const pageGroups = usePageGroups();
  const currentPageId = useNavigationParam('pageKey');
  return pageGroups && currentPageId;
}

export const SIDEBAR_BREAKPOINT = 1450;

export const CHECK_USE_HAS_GROUPED_NAVIGATION_ERROR =
  'AppNavigation was used without first checking that the app uses grouped navigation using `useHasGroupedNavigation()`. This can lead to an empty container somewhere.';

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
export function useValidationsForPageGroup(group: Group) {
  const traversalSelector = useLaxNodeTraversalSelector();
  const validationsSelector = NodesInternal.useLaxValidationsSelector();

  const pages = traversalSelector(
    (traverser) => {
      const allNodes: Record<string, LayoutNode[]> = {};
      const pageHasRequiredNodes: Record<string, boolean> = {};

      group.order.forEach((pageId) => {
        const page = traverser.findPage(pageId);

        allNodes[pageId] = page?.flat() ?? [];
        pageHasRequiredNodes[pageId] = page
          ? traverser.with(page).flat((n) => n.type === 'node' && nodeDataIsRequired(n)).length > 0
          : false;
      });

      return { allNodes, hasRequiredNodes: pageHasRequiredNodes };
    },
    [group],
  );

  const isCompleted = useMemo(() => {
    if (pages === ContextNotProvided) {
      return ContextNotProvided;
    }

    const pageHasNoErrors = Object.fromEntries(
      group.order.map((page) => [
        page,
        pages.allNodes[page].every((node) => {
          const allValidations = validationsSelector(node, ValidationMask.All, 'error');
          return allValidations !== ContextNotProvided && allValidations.length === 0;
        }),
      ]),
    );

    const completedPages = Object.fromEntries(
      group.order.map((page) => [page, pages.hasRequiredNodes[page] && pageHasNoErrors[page]]),
    );

    const groupIsComplete =
      group.order.some((page) => pages.hasRequiredNodes[page]) && group.order.every((page) => pageHasNoErrors[page]);

    return { pages: completedPages, group: groupIsComplete };
  }, [group, pages, validationsSelector]);

  const hasErrors = useMemo(() => {
    if (pages === ContextNotProvided) {
      return ContextNotProvided;
    }

    const pageHasErrors = Object.fromEntries(
      group.order.map((page) => [
        page,
        pages.allNodes[page].some((node) => {
          const visibleValidations = validationsSelector(node, 'visible', 'error');
          return visibleValidations !== ContextNotProvided && visibleValidations.length > 0;
        }),
      ]),
    );

    const groupHasErrors = Object.values(pageHasErrors).some((p) => p);

    return { pages: pageHasErrors, group: groupHasErrors };
  }, [group, pages, validationsSelector]);

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
    (('required' in item && item.required) ||
      ('minCount' in item && item.minCount) ||
      ('minNumberOfAttachments' in item && item.minNumberOfAttachments))
  );
}
