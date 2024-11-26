import React, { Fragment, useEffect, useState } from 'react';

import { Heading } from '@digdir/designsystemet-react';
import { CheckmarkIcon, ChevronDownIcon, ExclamationmarkIcon, FolderIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { ContextNotProvided } from 'src/core/contexts/context';
import { useLaxLayoutSettings, useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/features/navigation/AppNavigation.module.css';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { useBrowserWidth } from 'src/hooks/useDeviceWidths';
import { useNavigatePage } from 'src/hooks/useNavigatePage';

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

  const [isOpen, setIsOpen] = useState(containsCurrentPage);
  useEffect(() => setIsOpen(containsCurrentPage), [containsCurrentPage]);

  return (
    <li>
      <button
        className={classes.groupButton}
        onClick={() => setIsOpen((o) => !o)}
      >
        <PageGroupSymbol
          error={false}
          ready={false}
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

function Page({ page }: { page: string }) {
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
          error={false}
          ready={false}
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

  const Icon = showError ? ExclamationmarkIcon : showReady ? CheckmarkIcon : Fragment;

  return (
    <div
      className={cn(classes.pageSymbol, {
        [classes.pageSymbolActive]: showActive,
        [classes.pageSymbolError]: showError,
        [classes.pageSymbolReady]: showReady,
        [classes.pageSymbolDefault]: !showError && !showReady,
      })}
    >
      <Icon aria-hidden />
    </div>
  );
}
