import React, { useEffect, useState } from 'react';

import { Button, Heading } from '@digdir/designsystemet-react';
import { CheckmarkIcon, ChevronDownIcon, ExclamationmarkIcon, FolderIcon, XMarkIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import type { Group } from '.';

import { ContextNotProvided } from 'src/core/contexts/context';
import { useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/features/navigation/AppNavigation.module.css';
import { CHECK_USE_HAS_GROUPED_NAVIGATION_ERROR, useValidationsForPageGroup } from 'src/features/navigation/utils';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { useNavigatePage } from 'src/hooks/useNavigatePage';

export function AppNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const groups = useLayoutSettings().pages.groups;

  if (!groups) {
    throw CHECK_USE_HAS_GROUPED_NAVIGATION_ERROR;
  }

  return (
    <ul className={classes.groupList}>
      {groups.map((group) => (
        <PageGroup
          key={group.name}
          group={group}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}

export function AppNavigationHeading({
  showClose,
  onClose,
}: { showClose?: undefined; onClose?: undefined } | { showClose: true; onClose: () => void }) {
  const { langAsString } = useLanguage();
  return (
    <div className={classes.navigationHeading}>
      <Heading
        level={3}
        size='sm'
      >
        <Lang id='navigation.form_pages' />
      </Heading>
      {showClose && (
        <Button
          variant='tertiary'
          color='second'
          size='sm'
          icon={true}
          onClick={onClose}
          aria-label={langAsString('general.close')}
        >
          <XMarkIcon aria-hidden />
        </Button>
      )}
    </div>
  );
}

function PageGroup({ group, onNavigate }: { group: Group; onNavigate?: () => void }) {
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
              onNavigate={onNavigate}
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

function Page({
  page,
  onNavigate,
  hasErrors,
  isComplete,
}: {
  page: string;
  onNavigate?: () => void;
  hasErrors: boolean;
  isComplete: boolean;
}) {
  const currentPageId = useNavigationParam('pageKey');
  const isCurrentPage = page === currentPageId;

  const { navigateToPage } = useNavigatePage();

  return (
    <li>
      <button
        className={classes.pageButton}
        onClick={() => {
          if (!isCurrentPage) {
            navigateToPage(page);
            onNavigate?.();
          }
        }}
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
