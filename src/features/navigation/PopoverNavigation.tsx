import React, { useEffect, useRef, useState } from 'react';

import { Button, Modal, Popover } from '@digdir/designsystemet-react';
import { ChevronDownCircleIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { useUiConfigContext } from 'src/features/form/layout/UiConfigContext';
import { usePageGroups, usePageSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useProcessTaskId } from 'src/features/instance/useProcessTaskId';
import { Lang } from 'src/features/language/Lang';
import { AppNavigation, AppNavigationHeading } from 'src/features/navigation/AppNavigation';
import classes from 'src/features/navigation/PopoverNavigation.module.css';
import { SIDEBAR_BREAKPOINT, useGetTaskName, useHasGroupedNavigation } from 'src/features/navigation/utils';
import { useIsReceiptPage, useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { useBrowserWidth, useIsMobile } from 'src/hooks/useDeviceWidths';
import { usePageOrder } from 'src/hooks/useNavigatePage';

export function PopoverNavigation(props: Parameters<typeof Button>[0]) {
  const hasGroupedNavigation = useHasGroupedNavigation();
  const { expandedWidth } = useUiConfigContext();
  const isScreenSmall = !useBrowserWidth((width) => width >= SIDEBAR_BREAKPOINT) || expandedWidth;
  const isReceiptPage = useIsReceiptPage();

  if (!hasGroupedNavigation || !isScreenSmall || isReceiptPage) {
    return null;
  }

  return <InnerPopoverNavigation {...props} />;
}

function InnerPopoverNavigation(props: Parameters<typeof Button>[0]) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    isDialogOpen && modalRef.current?.showModal();
    !isDialogOpen && modalRef.current?.close();
  }, [isMobile, isDialogOpen]);

  const closeDialog = () => setIsDialogOpen(false);
  const toggleDialog = () => setIsDialogOpen((o) => !o);

  if (!isMobile) {
    return (
      <div className={classes.popoverWrapper}>
        <Popover
          open={isDialogOpen}
          onClose={closeDialog}
        >
          <Popover.Trigger
            onClick={toggleDialog}
            variant='secondary'
            color='first'
            size='sm'
            {...props}
            className={cn(classes.popoverButton, { [classes.popoverButtonActive]: isDialogOpen }, props.className)}
          >
            <PopoverNavigationButtonContent isOpen={isDialogOpen} />
          </Popover.Trigger>
          <Popover.Content
            className={classes.popoverContainer}
            aria-modal
            autoFocus={true}
          >
            <AppNavigationHeading
              showClose={true}
              onClose={closeDialog}
            />
            <div style={{ paddingRight: 12 }}>
              <AppNavigation onNavigate={closeDialog} />
            </div>
          </Popover.Content>
        </Popover>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={toggleDialog}
        variant='secondary'
        color='first'
        size='sm'
        {...props}
        className={cn(classes.popoverButton, { [classes.popoverButtonActive]: isDialogOpen }, props.className)}
      >
        <PopoverNavigationButtonContent isOpen={isDialogOpen} />
      </Button>
      <Modal
        role='dialog'
        ref={modalRef}
        onInteractOutside={closeDialog}
        className={classes.modal}
      >
        <Modal.Content className={classes.modalContainer}>
          <AppNavigationHeading
            showClose={true}
            onClose={closeDialog}
          />
          <div style={{ paddingRight: 12 }}>
            <AppNavigation onNavigate={closeDialog} />
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
}

function PopoverNavigationButtonContent({ isOpen }: { isOpen: boolean }) {
  const pageGroupProgress = usePageGroupProgress();
  const taskProgress = useTaskProgress();

  const progress = pageGroupProgress ?? taskProgress;

  return (
    <>
      <ChevronDownCircleIcon
        className={cn(classes.popoverButtonIcon, {
          [classes.popoverButtonIconMargin]: !!pageGroupProgress,
          [classes.popoverButtonIconOpen]: isOpen,
        })}
        aria-hidden
      />
      {progress && (
        <>
          <span className={classes.popoverButtonName}>
            <Lang id={progress.name} />
          </span>
          <span>
            {progress.pageNumber}/{progress.pageCount}
          </span>
        </>
      )}
    </>
  );
}

type NavigationButtonData = {
  name: string;
  pageNumber: number;
  pageCount: number;
};

function usePageGroupProgress(): NavigationButtonData | null {
  const currentPageId = useNavigationParam('pageKey');
  const groups = usePageGroups();

  if (!groups || !currentPageId) {
    return null;
  }

  const currentGroup = groups.find((group) => group.order.includes(currentPageId));

  if (!currentGroup) {
    return null;
  }

  const pageCount = currentGroup.order.length;
  const pageIndex = currentGroup.order.indexOf(currentPageId);

  const name = 'name' in currentGroup ? currentGroup.name : currentGroup.order[0];

  if (pageIndex > -1) {
    return { name, pageNumber: pageIndex + 1, pageCount };
  }

  return { name, pageNumber: 1, pageCount: 1 };
}

function useTaskProgress(): NavigationButtonData | null {
  const taskGroups = usePageSettings().taskNavigation;

  const currentPageId = useNavigationParam('pageKey');
  const order = usePageOrder();
  const currentTaskId = useProcessTaskId();
  const isReceipt = useIsReceiptPage();

  const getTaskName = useGetTaskName();

  const currentGroup = taskGroups.find(
    (group) =>
      ('type' in group && group.type === 'receipt' && isReceipt) ||
      ('taskId' in group && group.taskId === currentTaskId),
  );

  if (!currentGroup) {
    return null;
  }

  if (currentPageId && order.length) {
    const pageCount = order.length;
    const pageIndex = order.indexOf(currentPageId);

    if (pageIndex > -1) {
      return { name: getTaskName(currentGroup), pageNumber: pageIndex + 1, pageCount };
    }
  }

  return { name: getTaskName(currentGroup), pageNumber: 1, pageCount: 1 };
}
