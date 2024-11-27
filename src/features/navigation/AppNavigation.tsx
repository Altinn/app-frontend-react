import React, { useEffect, useMemo, useState } from 'react';

import { Heading } from '@digdir/designsystemet-react';
import { CheckmarkIcon, ChevronDownIcon, ExclamationmarkIcon, FolderIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { ContextNotProvided } from 'src/core/contexts/context';
import { useLaxLayoutSettings, useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/features/navigation/AppNavigation.module.css';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { ValidationMask } from 'src/features/validation';
import { useBrowserWidth } from 'src/hooks/useDeviceWidths';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useLaxNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodeData } from 'src/utils/layout/types';

function useHasGroupedNavigation() {
  const maybeLayoutSettings = useLaxLayoutSettings();
  return maybeLayoutSettings !== ContextNotProvided && !!maybeLayoutSettings.pages.groups;
}

export function SideBarNavigation() {
  const hasGroupedNavigation = useHasGroupedNavigation();
  const isScreenLarge = useBrowserWidth((width) => width >= 1400);

  if (!hasGroupedNavigation || !isScreenLarge) {
    return null;
  }

  return (
    <aside className={classes.sidebarContainer}>
      <AppNavigation />
    </aside>
  );
}

type Group = { name: string; order: string[] };

function AppNavigation() {
  const groups = useLayoutSettings().pages.groups;

  if (!groups) {
    throw 'AppNavigation was used without first checking that the app uses grouped navigation using `useHasGroupedNavigation()`. This can lead to an empty container somewhere.';
  }

  return (
    <>
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
    </>
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
          error={validations !== ContextNotProvided && validations.errors.group}
          ready={validations !== ContextNotProvided && validations.completed.group}
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
              hasErrors={validations !== ContextNotProvided && validations.errors.pages[page]}
              isComplete={validations !== ContextNotProvided && validations.completed.pages[page]}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function PageGroupSymbol({ error, ready }: { error: boolean; ready: boolean }) {
  const showError = error;
  const showReady = ready && !error;

  const Icon = showError ? ExclamationmarkIcon : showReady ? CheckmarkIcon : FolderIcon;

  return (
    <div
      className={cn(classes.groupSymbol, {
        [classes.groupSymbolError]: showError,
        [classes.groupSymbolReady]: showReady,
        [classes.groupSymbolDefault]: !showError && !showReady,
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
          ready={isComplete}
          active={isCurrentPage}
        />

        <span className={classes.pageName}>
          <Lang id={page} />
        </span>
      </button>
    </li>
  );
}

function PageSymbol({ error, ready, active }: { error: boolean; ready: boolean; active: boolean }) {
  const showActive = active;
  const showError = error && !active;
  const showReady = ready && !error && !active;

  const Icon = showError ? ExclamationmarkIcon : showReady ? CheckmarkIcon : null;

  return (
    <div
      className={cn(classes.pageSymbol, {
        [classes.pageSymbolActive]: showActive,
        [classes.pageSymbolError]: showError,
        [classes.pageSymbolReady]: showReady,
        [classes.pageSymbolDefault]: !showError && !showReady,
      })}
    >
      {Icon && <Icon aria-hidden />}
    </div>
  );
}

function useValidationsForPageGroup(group: Group) {
  const traversalSelector = useLaxNodeTraversalSelector();
  const validationsSelector = NodesInternal.useLaxValidationsSelector();

  const nodes = traversalSelector(
    (traverser) => {
      const all: Record<string, LayoutNode[]> = {};
      const required: Record<string, LayoutNode[]> = {};
      group.order.forEach((pageId) => {
        const page = traverser.findPage(pageId);
        all[pageId] = page?.flat() ?? [];
        required[pageId] = page ? traverser.with(page).flat((n) => n.type === 'node' && nodeDataIsRequired(n)) : [];
      });
      return { all, required };
    },
    [group],
  );

  const completed = useMemo(() => {
    if (nodes === ContextNotProvided) {
      return ContextNotProvided;
    }

    const pages = Object.fromEntries(
      Object.entries(nodes.required).map(([page, nodes]) => [
        page,
        nodes.length > 0 &&
          nodes.every((node) => {
            const requiredValidations = validationsSelector(node, ValidationMask.Required, 'error');
            return requiredValidations !== ContextNotProvided && requiredValidations.length === 0;
          }),
      ]),
    );

    const group =
      Object.values(nodes.required).some((requiredNodes) => requiredNodes.length > 0) &&
      Object.entries(nodes.required).every(([page, required]) => required.length === 0 || pages[page]);

    return { pages, group };
  }, [nodes, validationsSelector]);

  const errors = useMemo(() => {
    if (nodes === ContextNotProvided) {
      return ContextNotProvided;
    }

    const pages = Object.fromEntries(
      Object.entries(nodes.all).map(([page, nodes]) => [
        page,
        nodes.some((node) => {
          const visibleValidations = validationsSelector(node, 'visible', 'error');
          return visibleValidations !== ContextNotProvided && visibleValidations.length > 0;
        }),
      ]),
    );

    const group = Object.values(pages).some((p) => p);

    return { pages, group };
  }, [nodes, validationsSelector]);

  if (completed === ContextNotProvided || errors === ContextNotProvided) {
    return ContextNotProvided;
  }

  return { completed, errors };
}

function nodeDataIsRequired(n: NodeData) {
  const item = n.item;
  return !!(item && 'required' in item && item.required === true);
}
