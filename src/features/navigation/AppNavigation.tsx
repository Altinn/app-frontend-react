import React, { useLayoutEffect, useState } from 'react';

import { Button, Heading, Spinner } from '@digdir/designsystemet-react';
import {
  CardIcon,
  CheckmarkIcon,
  ChevronDownIcon,
  FolderIcon,
  InformationIcon,
  PencilLineIcon,
  ReceiptIcon,
  SealCheckmarkIcon,
  TasklistIcon,
  XMarkIcon,
} from '@navikt/aksel-icons';
import cn from 'classnames';

import { ContextNotProvided } from 'src/core/contexts/context';
import { useIsProcessing } from 'src/core/contexts/processingContext';
import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
import { usePageGroups, usePageSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useStrictDataElements } from 'src/features/instance/InstanceContext';
import { useGetAltinnTaskType } from 'src/features/instance/ProcessContext';
import { useProcessTaskId } from 'src/features/instance/useProcessTaskId';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/features/navigation/AppNavigation.module.css';
import {
  isSingleGroup,
  useGetTaskGroupType,
  useGetTaskName,
  useValidationsForPages,
  useVisiblePages,
} from 'src/features/navigation/utils';
import {
  useIsReceiptPage,
  useIsSubformPage,
  useNavigate,
  useNavigationParam,
} from 'src/features/routing/AppRoutingContext';
import { isSubformValidation } from 'src/features/validation';
import { useComponentValidationsForNode } from 'src/features/validation/selectors/componentValidationsForNode';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { getSubformEntryName, useSubformDataSources } from 'src/layout/Subform/utils';
import { NodesInternal, useNode } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { ExprVal, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type {
  NavigationPageGroup,
  NavigationPageGroupMultiple,
  NavigationPageGroupSingle,
  NavigationReceipt,
  NavigationTask,
} from 'src/layout/common.generated';
import type { IData } from 'src/types/shared';

export function AppNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pageGroups = usePageGroups();
  const taskGroups = usePageSettings().taskNavigation;

  const currentTaskId = useProcessTaskId();
  const isReceipt = useIsReceiptPage();
  const isSubform = useIsSubformPage();

  if (!isSubform && taskGroups.length) {
    return (
      <ul
        data-testid='page-navigation'
        className={classes.groupList}
      >
        {taskGroups.map((taskGroup) => {
          if ('taskId' in taskGroup && taskGroup.taskId === currentTaskId && pageGroups) {
            return pageGroups.map((group) => (
              <PageGroup
                key={group.id}
                group={group}
                onNavigate={onNavigate}
              />
            ));
          }

          const receiptActive = 'type' in taskGroup && taskGroup.type === 'receipt' && isReceipt;
          const taskActive = 'taskId' in taskGroup && taskGroup.taskId === currentTaskId;
          return (
            <TaskGroup
              key={taskGroup.id}
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
      <ul
        data-testid='page-navigation'
        className={classes.groupList}
      >
        {pageGroups.map((group) => (
          <PageGroup
            key={group.id}
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
        id='app-navigation-heading'
        level={3}
        size='xs'
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

function getTaskIcon(taskType: string | undefined) {
  switch (taskType) {
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
    default:
      return FolderIcon;
  }
}

function TaskGroup({ group, active }: { group: NavigationTask | NavigationReceipt; active: boolean }) {
  const getTaskType = useGetTaskGroupType();
  const getTaskName = useGetTaskName();

  const Icon = getTaskIcon(getTaskType(group));

  return (
    <li>
      <button
        aria-current={active ? 'step' : undefined}
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

function PageGroup({ group, onNavigate }: { group: NavigationPageGroup; onNavigate?: () => void }) {
  const visiblePages = useVisiblePages(group.order);
  const currentPageId = useNavigationParam('pageKey');
  const containsCurrentPage = visiblePages.some((page) => page === currentPageId);
  const validations = useValidationsForPages(visiblePages, group.markWhenCompleted);

  if (visiblePages.length === 0) {
    return null;
  }

  if (isSingleGroup(group)) {
    return (
      <PageGroupSingle
        group={group}
        visiblePages={visiblePages}
        containsCurrentPage={containsCurrentPage}
        validations={validations}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <PageGroupMultiple
      group={group}
      visiblePages={visiblePages}
      containsCurrentPage={containsCurrentPage}
      validations={validations}
      onNavigate={onNavigate}
    />
  );
}

type PageGroupProps<T extends NavigationPageGroup> = {
  group: T;
  visiblePages: string[];
  containsCurrentPage: boolean;
  validations: ReturnType<typeof useValidationsForPages>;
  onNavigate?: () => void;
};

function PageGroupSingle({
  group,
  containsCurrentPage: isCurrentPage,
  validations,
  onNavigate,
}: PageGroupProps<NavigationPageGroupSingle>) {
  const { navigateToPage } = useNavigatePage();
  const { performProcess, isAnyProcessing, isThisProcessing: isNavigating } = useIsProcessing();
  const page = group.order[0];

  return (
    <li>
      <button
        disabled={isAnyProcessing}
        aria-current={isCurrentPage ? 'page' : undefined}
        className={cn(classes.groupButton, classes.groupButtonSingle, 'fds-focus')}
        onClick={() =>
          performProcess(async () => {
            if (!isCurrentPage) {
              await navigateToPage(page);
              onNavigate?.();
            }
          })
        }
      >
        <PageGroupSymbol
          single
          type={group.type}
          active={isCurrentPage}
          error={validations !== ContextNotProvided && validations.hasErrors.group}
          complete={validations !== ContextNotProvided && validations.isCompleted.group}
          isLoading={isNavigating}
        />
        <span className={cn(classes.groupName, { [classes.groupNameActive]: isCurrentPage })}>
          <Lang id={page} />
        </span>
      </button>
    </li>
  );
}

function PageGroupMultiple({
  group,
  visiblePages,
  containsCurrentPage,
  validations,
  onNavigate,
}: PageGroupProps<NavigationPageGroupMultiple>) {
  const { langAsString } = useLanguage();
  const buttonId = `navigation-button-${group.id}`;
  const listId = `navigation-page-list-${group.id}`;

  const [isOpen, setIsOpen] = useState(containsCurrentPage);
  useLayoutEffect(() => setIsOpen(containsCurrentPage), [containsCurrentPage]);

  return (
    <li>
      <button
        id={buttonId}
        aria-current={containsCurrentPage ? 'step' : undefined}
        aria-expanded={isOpen}
        aria-owns={listId}
        aria-label={langAsString(group.name)}
        className={cn(classes.groupButton, { [classes.groupButtonOpen]: isOpen }, 'fds-focus')}
        onClick={() => setIsOpen((o) => !o)}
      >
        <PageGroupSymbol
          open={isOpen}
          type={group.type}
          active={containsCurrentPage}
          error={validations !== ContextNotProvided && validations.hasErrors.group}
          complete={validations !== ContextNotProvided && validations.isCompleted.group}
        />
        <span className={cn(classes.groupName, { [classes.groupNameActive]: containsCurrentPage && !isOpen })}>
          <Lang id={group.name} />
        </span>
        <ChevronDownIcon
          aria-hidden
          data-testid='chevron'
          className={cn(classes.groupChevron, { [classes.groupChevronOpen]: isOpen })}
        />
      </button>
      <ul
        id={listId}
        aria-labelledby={buttonId}
        style={!isOpen ? { display: 'none' } : undefined}
        className={cn(classes.pageList)}
      >
        {visiblePages.map((page) => (
          <Page
            key={page}
            page={page}
            onNavigate={onNavigate}
            hasErrors={validations !== ContextNotProvided && validations.hasErrors.pages[page]}
            isComplete={validations !== ContextNotProvided && validations.isCompleted.pages[page]}
          />
        ))}
      </ul>
    </li>
  );
}

function PageGroupSymbol({
  type,
  error,
  complete,
  active,
  single = false,
  open = false,
  isLoading = false,
}: {
  type: NavigationPageGroup['type'];
  error: boolean;
  complete: boolean;
  active: boolean;
  single?: boolean;
  open?: boolean;
  isLoading?: boolean;
}) {
  const { langAsString } = useLanguage();
  const getTaskType = useGetAltinnTaskType();
  const currentTaskId = useProcessTaskId();

  const showActive = active && !open;
  const showError = error && !active && !open;
  const showComplete = complete && !error && !active && !open;

  const Icon = showError
    ? XMarkIcon
    : showComplete
      ? CheckmarkIcon
      : type === 'info'
        ? InformationIcon
        : !single
          ? getTaskIcon(getTaskType(currentTaskId))
          : null;

  const testid = showError ? 'state-error' : showComplete ? 'state-complete' : undefined;

  if (isLoading) {
    return (
      <Spinner
        style={{ width: 28, height: 28 }}
        title={langAsString('general.loading')}
      />
    );
  }

  return (
    <div
      className={cn(classes.groupSymbol, {
        [classes.groupSymbolInfo]: type === 'info',
        [classes.groupSymbolSingle]: single,
        [classes.groupSymbolError]: showError,
        [classes.groupSymbolComplete]: showComplete,
        [classes.groupSymbolActive]: showActive,
        [classes.groupSymbolDefault]: !showError && !showComplete && !showActive,
      })}
    >
      {Icon && (
        <Icon
          aria-hidden
          data-testid={testid}
        />
      )}
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
  const { performProcess, isAnyProcessing, isThisProcessing: isNavigating } = useIsProcessing();

  return (
    <li className={classes.pageListItem}>
      <button
        disabled={isAnyProcessing}
        aria-current={isCurrentPage ? 'page' : undefined}
        className={cn(classes.pageButton, 'fds-focus')}
        onClick={() =>
          performProcess(async () => {
            if (!isCurrentPage) {
              await navigateToPage(page);
              onNavigate?.();
            }
          })
        }
      >
        <PageSymbol
          error={hasErrors}
          complete={isComplete}
          active={isCurrentPage}
          isLoading={isNavigating}
        />

        <span className={cn(classes.pageName, { [classes.pageNameActive]: isCurrentPage })}>
          <Lang id={page} />
        </span>
      </button>
      <SubformsForPage pageKey={page} />
    </li>
  );
}

function PageSymbol({
  error,
  complete,
  active,
  isLoading,
}: {
  error: boolean;
  complete: boolean;
  active: boolean;
  isLoading: boolean;
}) {
  const { langAsString } = useLanguage();
  const showActive = active;
  const showError = error && !active;
  const showComplete = complete && !error && !active;

  const Icon = showError ? XMarkIcon : showComplete ? CheckmarkIcon : null;
  const testid = showError ? 'state-error' : showComplete ? 'state-complete' : undefined;

  if (isLoading) {
    return (
      <Spinner
        style={{ width: 20, height: 20 }}
        title={langAsString('general.loading')}
      />
    );
  }

  return (
    <div
      className={cn(classes.pageSymbol, {
        [classes.pageSymbolActive]: showActive,
        [classes.pageSymbolError]: showError,
        [classes.pageSymbolComplete]: showComplete,
        [classes.pageSymbolDefault]: !showError && !showComplete,
      })}
    >
      {Icon && (
        <Icon
          aria-hidden
          data-testid={testid}
        />
      )}
    </div>
  );
}

function SubformsForPage({ pageKey }: { pageKey: string }) {
  const subformIds = NodesInternal.useLaxMemoSelector(({ nodeData }) =>
    Object.values(nodeData)
      .filter((node) => node.pageKey === pageKey && node.layout.type === 'Subform')
      .map((node) => node.layout.id),
  );

  if (subformIds === ContextNotProvided || !subformIds.length) {
    return null;
  }

  return subformIds.map((nodeId) => (
    <SubformGroup
      key={nodeId}
      nodeId={nodeId}
    />
  ));
}

function SubformGroup({ nodeId }: { nodeId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const node = useNode(nodeId);
  if (!node?.isType('Subform')) {
    // This should never happen, @see SubformsForPage
    throw new Error(`Navigation expected component: "${nodeId}" to exist and be of type: "Subform"`);
  }
  const subformIdsWithError = useComponentValidationsForNode(node).find(isSubformValidation)?.subformDataElementIds;
  const { layoutSet, textResourceBindings, entryName } = useNodeItem(node);
  const dataType = useDataTypeFromLayoutSet(layoutSet);
  if (!dataType) {
    throw new Error(`Unable to find data type for subform with id ${nodeId}`);
  }
  const dataElements = useStrictDataElements(dataType);

  if (!dataElements.length || !entryName) {
    return null;
  }

  const buttonId = `navigation-button-${dataType}`;
  const listId = `navigation-subform-list-${dataType}`;

  return (
    <div className={classes.subformContainer}>
      <button
        id={buttonId}
        aria-expanded={isOpen}
        aria-owns={listId}
        onClick={() => setIsOpen((o) => !o)}
        className={cn(classes.subformExpandButton, 'fds-focus')}
      >
        <span className={classes.subformGroupName}>
          <Lang id={textResourceBindings?.title} />
          &nbsp;({dataElements.length})
        </span>
        <ChevronDownIcon
          aria-hidden
          className={cn(classes.subformExpandChevron, { [classes.subformExpandChevronOpen]: isOpen })}
        />
      </button>
      <ul
        id={listId}
        aria-labelledby={buttonId}
        style={!isOpen ? { display: 'none' } : undefined}
        className={cn(classes.subformList)}
      >
        {dataElements.map((dataElement) => (
          <SubformLink
            key={dataElement.id}
            entryName={entryName}
            nodeId={nodeId}
            dataElement={dataElement}
            hasErrors={Boolean(subformIdsWithError?.includes(dataElement.id))}
          />
        ))}
      </ul>
    </div>
  );
}

function SubformLink({
  entryName,
  nodeId,
  dataElement,
  hasErrors,
}: {
  entryName: ExprValToActualOrExpr<ExprVal.String>;
  nodeId: string;
  dataElement: IData;
  hasErrors: boolean;
}) {
  const { isAnyProcessing: disabled } = useIsProcessing();
  const navigate = useNavigate();
  const { subformDataSources, isSubformDataFetching, subformDataError } = useSubformDataSources(dataElement);

  const subformEntryName =
    !isSubformDataFetching && !subformDataError
      ? getSubformEntryName(entryName, subformDataSources, { type: 'node', id: nodeId })
      : null;

  if (!subformEntryName) {
    return null;
  }

  return (
    <li>
      <button
        disabled={disabled}
        className={cn(classes.subformLink, 'fds-focus')}
        onClick={() => navigate(`${nodeId}/${dataElement.id}${hasErrors ? '?validate=true' : ''}`)}
      >
        <span className={classes.subformLinkName}>{subformEntryName}</span>
      </button>
    </li>
  );
}
