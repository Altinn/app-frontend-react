import React, { useEffect, useState } from 'react';

import { Button, Heading } from '@digdir/designsystemet-react';
import {
  CardIcon,
  CheckmarkIcon,
  ChevronDownIcon,
  ExclamationmarkIcon,
  FolderIcon,
  PencilLineIcon,
  ReceiptIcon,
  SealCheckmarkIcon,
  TasklistIcon,
  XMarkIcon,
} from '@navikt/aksel-icons';
import cn from 'classnames';

import { ContextNotProvided } from 'src/core/contexts/context';
import { usePageGroups, usePageSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useProcessTaskId } from 'src/features/instance/useProcessTaskId';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/features/navigation/AppNavigation.module.css';
import { getTaskName, useValidationsForPages, useVisiblePages } from 'src/features/navigation/utils';
import { useIsReceiptPage, useIsSubformPage, useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { useGetUniqueKeyFromObject } from 'src/utils/useGetKeyFromObject';
import type { NavigationPageGroup, NavigationReceipt, NavigationTask } from 'src/layout/common.generated';

export function AppNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const getKey = useGetUniqueKeyFromObject();

  const pageGroups = usePageGroups();
  const taskGroups = usePageSettings().taskNavigation;

  const currentTaskId = useProcessTaskId();
  const isReceipt = useIsReceiptPage();
  const isSubform = useIsSubformPage();

  if (!isSubform && taskGroups.length) {
    return (
      <ul className={classes.groupList}>
        {taskGroups.map((taskGroup) => {
          if ('taskId' in taskGroup && taskGroup.taskId === currentTaskId && pageGroups) {
            return pageGroups.map((group) => (
              <PageGroup
                key={getKey(group)}
                group={group}
                onNavigate={onNavigate}
              />
            ));
          }

          const receiptActive = isReceipt && taskGroup.type === 'receipt';
          const taskActive = 'taskId' in taskGroup && taskGroup.taskId === currentTaskId;
          return (
            <TaskGroup
              key={getKey(taskGroup)}
              group={taskGroup}
              active={receiptActive || taskActive}
            />
          );
        })}
      </ul>
    );
  }

  if (pageGroups) {
    return (
      <ul className={classes.groupList}>
        {pageGroups.map((group) => (
          <PageGroup
            key={group.name}
            group={group}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    );
  }

  return null;
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

function TaskGroup({ group, active }: { group: NavigationTask | NavigationReceipt; active: boolean }) {
  const Icon = getTaskIcon(group.type);

  return (
    <li>
      <button
        disabled
        className={cn(classes.taskButton, 'fds-focus')}
      >
        <div className={cn(classes.groupSymbol, active ? classes.taskSymbolActive : classes.taskSymbolLocked)}>
          <Icon aria-hidden />
        </div>
        <span className={cn(classes.groupName, { [classes.groupNameActive]: active })}>
          <Lang id={getTaskName(group)} />
        </span>
      </button>
    </li>
  );
}

function getTaskIcon(type: NavigationTask['type'] | NavigationReceipt['type']) {
  switch (type) {
    case 'data':
      return TasklistIcon;
    case 'confirmation':
      return SealCheckmarkIcon;
    case 'signing':
      return PencilLineIcon;
    case 'payment':
      return CardIcon;
    case 'receipt':
      return ReceiptIcon;
  }
}

function PageGroup({ group, onNavigate }: { group: NavigationPageGroup; onNavigate?: () => void }) {
  const order = useVisiblePages(group.order);
  const currentPageId = useNavigationParam('pageKey');
  const containsCurrentPage = order.some((page) => page === currentPageId);
  const validations = useValidationsForPages(order);

  const [isOpen, setIsOpen] = useState(containsCurrentPage);
  useEffect(() => setIsOpen(containsCurrentPage), [containsCurrentPage]);

  if (order.length === 0) {
    return null;
  }

  return (
    <li>
      <button
        className={cn(classes.groupButton, 'fds-focus')}
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
          {order.map((page) => (
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
        className={cn(classes.pageButton, 'fds-focus')}
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
