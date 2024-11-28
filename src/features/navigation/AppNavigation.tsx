import React, { useEffect, useMemo, useState } from 'react';
import type { JSX, PropsWithChildren } from 'react';

import { Button, Heading, Popover } from '@digdir/designsystemet-react';
import {
  CheckmarkIcon,
  ChevronDownIcon,
  ExclamationmarkIcon,
  FolderIcon,
  MenuHamburgerIcon,
} from '@navikt/aksel-icons';
import cn from 'classnames';

import { ContextNotProvided } from 'src/core/contexts/context';
import { useUiConfigContext } from 'src/features/form/layout/UiConfigContext';
import { useLaxLayoutSettings, useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/features/navigation/AppNavigation.module.css';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { ValidationMask } from 'src/features/validation';
import { useBrowserWidth, useIsMobile } from 'src/hooks/useDeviceWidths';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useLaxNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeData } from 'src/utils/layout/types';

function useHasGroupedNavigation() {
  const maybeLayoutSettings = useLaxLayoutSettings();
  const currentPageId = useNavigationParam('pageKey');
  return maybeLayoutSettings !== ContextNotProvided && !!maybeLayoutSettings.pages.groups && currentPageId;
}

const CHECK_USE_HAS_GROUPED_NAVIGATION_ERROR =
  'AppNavigation was used without first checking that the app uses grouped navigation using `useHasGroupedNavigation()`. This can lead to an empty container somewhere.';

export function SideBarNavigation() {
  const hasGroupedNavigation = useHasGroupedNavigation();
  const { expandedWidth } = useUiConfigContext();
  const isScreenLarge = useBrowserWidth((width) => width >= 1450) && !expandedWidth;

  if (!hasGroupedNavigation || !isScreenLarge) {
    return null;
  }

  return (
    <aside className={classes.sidebarContainer}>
      <AppNavigation />
    </aside>
  );
}
export function PopoverNavigation({
  children,
  wrapper,
}: PropsWithChildren<{ wrapper: (children: React.ReactNode) => JSX.Element }>) {
  const hasGroupedNavigation = useHasGroupedNavigation();
  const { expandedWidth } = useUiConfigContext();
  const isScreenSmall = !useBrowserWidth((width) => width >= 1450) || expandedWidth;
  if (!hasGroupedNavigation || !isScreenSmall) {
    return wrapper(children);
  }

  return <InnerPopoverNavigation wrapper={wrapper}>{children}</InnerPopoverNavigation>;
}

function InnerPopoverNavigation({
  children,
  wrapper,
}: PropsWithChildren<{ wrapper: (children: React.ReactNode) => JSX.Element }>) {
  const currentPageId = useNavigationParam('pageKey');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const groups = useLayoutSettings().pages.groups;
  const isMobile = useIsMobile();

  if (!groups || !currentPageId) {
    throw CHECK_USE_HAS_GROUPED_NAVIGATION_ERROR;
  }

  const currentGroup = groups.find((group) => group.order.includes(currentPageId));
  const currentGroupLength = currentGroup?.order.length;
  const currentGroupIndex = currentGroup?.order.indexOf(currentPageId);
  const hasCurrentGroup =
    currentGroup && typeof currentGroupIndex === 'number' && typeof currentGroupLength === 'number';

  return wrapper(
    <>
      {!isMobile && children}
      <div className={classes.popoverWrapper}>
        <Popover
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          size='lg'
          placement='bottom-end'
        >
          <Popover.Trigger asChild={true}>
            <Button
              variant='secondary'
              color='first'
              size='sm'
              onClick={() => setIsDialogOpen((o) => !o)}
            >
              {hasCurrentGroup && (
                <Lang
                  id='navigation.popover_button_progress'
                  params={[{ key: currentGroup.name }, currentGroupIndex + 1, currentGroupLength]}
                />
              )}
              <MenuHamburgerIcon
                className={cn({ [classes.burgerMenuIcon]: hasCurrentGroup })}
                aria-hidden
              />
            </Button>
          </Popover.Trigger>
          <Popover.Content
            className={classes.popoverContainer}
            aria-modal
            autoFocus={true}
          >
            {isMobile && wrapper(children)}
            <AppNavigation />
          </Popover.Content>
        </Popover>
      </div>
    </>,
  );
}

type Group = { name: string; order: string[] };

function AppNavigation() {
  const groups = useLayoutSettings().pages.groups;

  if (!groups) {
    throw 'AppNavigation was used without first checking that the app uses grouped navigation using `useHasGroupedNavigation()`. This can lead to an empty container somewhere.';
  }

  return (
    <div>
      <Heading
        level={3}
        size='sm'
        className={classes.navigationHeader}
      >
        <Lang id='navigation.form_pages' />
      </Heading>
      <ul className={classes.groupList}>
        {groups.map((group) => (
          <PageGroup
            key={group.name}
            group={group}
          />
        ))}
      </ul>
    </div>
  );
}

function PageGroup({ group }: { group: Group }) {
  const currentPageId = useNavigationParam('pageKey');
  const containsCurrentPage = group.order.some((page) => page === currentPageId);
  const validations = useValidationsForPageGroup(group);

  const [isOpen, setIsOpen] = useState(containsCurrentPage);
  useEffect(() => setIsOpen(containsCurrentPage), [containsCurrentPage]);

  return (
    <li>
      <button
        className={classes.groupButton}
        onClick={() => setIsOpen((o) => !o)}
      >
        <PageGroupSymbol
          open={isOpen}
          error={validations !== ContextNotProvided && validations.hasErrors.group}
          complete={validations !== ContextNotProvided && validations.isCompleted.group}
        />
        <span className={classes.groupName}>
          <Lang id={group.name} />
        </span>
        <ChevronDownIcon className={cn(classes.groupChevron, { [classes.groupChevronOpen]: isOpen })} />
      </button>
      {isOpen && (
        <ul className={classes.pageList}>
          {group.order.map((page) => (
            <Page
              key={page}
              page={page}
              hasErrors={validations !== ContextNotProvided && validations.hasErrors.pages[page]}
              isComplete={validations !== ContextNotProvided && validations.isCompleted.pages[page]}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function PageGroupSymbol({ error, complete, open }: { error: boolean; complete: boolean; open: boolean }) {
  const showError = error && !open;
  const showComplete = complete && !error && !open;

  const Icon = showError ? ExclamationmarkIcon : showComplete ? CheckmarkIcon : FolderIcon;

  return (
    <div
      className={cn(classes.groupSymbol, {
        [classes.groupSymbolError]: showError,
        [classes.groupSymbolComplete]: showComplete,
        [classes.groupSymbolDefault]: !showError && !showComplete,
      })}
    >
      <Icon aria-hidden />
    </div>
  );
}

function Page({ page, hasErrors, isComplete }: { page: string; hasErrors: boolean; isComplete: boolean }) {
  const currentPageId = useNavigationParam('pageKey');
  const isCurrentPage = page === currentPageId;

  const { navigateToPage } = useNavigatePage();

  return (
    <li>
      <button
        className={classes.pageButton}
        onClick={() => navigateToPage(page)}
      >
        <PageSymbol
          error={hasErrors}
          complete={isComplete}
          active={isCurrentPage}
        />

        <span className={classes.pageName}>
          <Lang id={page} />
        </span>
      </button>
    </li>
  );
}

function PageSymbol({ error, complete, active }: { error: boolean; complete: boolean; active: boolean }) {
  const showActive = active;
  const showError = error && !active;
  const showComplete = complete && !error && !active;

  const Icon = showError ? ExclamationmarkIcon : showComplete ? CheckmarkIcon : null;

  return (
    <div
      className={cn(classes.pageSymbol, {
        [classes.pageSymbolActive]: showActive,
        [classes.pageSymbolError]: showError,
        [classes.pageSymbolComplete]: showComplete,
        [classes.pageSymbolDefault]: !showError && !showComplete,
      })}
    >
      {Icon && <Icon aria-hidden />}
    </div>
  );
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
function useValidationsForPageGroup(group: Group) {
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
