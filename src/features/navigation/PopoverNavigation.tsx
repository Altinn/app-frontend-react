import React, { useEffect, useRef, useState } from 'react';
import type { JSX, PropsWithChildren, ReactNode } from 'react';

import { Button, Modal, Popover } from '@digdir/designsystemet-react';
import { MenuHamburgerIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { useUiConfigContext } from 'src/features/form/layout/UiConfigContext';
import { usePageGroups, usePageSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useProcessTaskId } from 'src/features/instance/useProcessTaskId';
import { Lang } from 'src/features/language/Lang';
import { AppNavigation, AppNavigationHeading } from 'src/features/navigation/AppNavigation';
import classes from 'src/features/navigation/PopoverNavigation.module.css';
import { getTaskName, SIDEBAR_BREAKPOINT, useHasGroupedNavigation } from 'src/features/navigation/utils';
import { useIsReceiptPage, useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { useBrowserWidth, useIsMobile } from 'src/hooks/useDeviceWidths';
import { usePageOrder } from 'src/hooks/useNavigatePage';

export function PopoverNavigation({
  children,
  wrapper,
}: PropsWithChildren<{ wrapper: (children: ReactNode) => JSX.Element }>) {
  const hasGroupedNavigation = useHasGroupedNavigation();
  const { expandedWidth } = useUiConfigContext();
  const isScreenSmall = !useBrowserWidth((width) => width >= SIDEBAR_BREAKPOINT) || expandedWidth;
  if (!hasGroupedNavigation || !isScreenSmall) {
    return wrapper(children);
  }

  return <InnerPopoverNavigation wrapper={wrapper}>{children}</InnerPopoverNavigation>;
}

function InnerPopoverNavigation({
  children,
  wrapper,
}: PropsWithChildren<{ wrapper: (children: React.ReactNode) => JSX.Element }>) {
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
    return wrapper(
      <>
        {children}
        <div className={classes.popoverWrapper}>
          <Popover
            open={isDialogOpen}
            onClose={closeDialog}
          >
            <Popover.Trigger asChild={true}>
              <PopoverNavigationButton onClick={toggleDialog} />
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
              <AppNavigation onNavigate={closeDialog} />
            </Popover.Content>
          </Popover>
        </div>
      </>,
    );
  }

  return (
    <>
      <PopoverNavigationButton onClick={toggleDialog} />
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
          <div className={classes.modalWrapper}>
            {wrapper(children)}
            <AppNavigation onNavigate={closeDialog} />
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
}

function PopoverNavigationButton(props: Parameters<typeof Button>[0]) {
  const pageGroupProgress = usePageGroupProgress();
  const taskProgress = useTaskProgress();

  const progress = pageGroupProgress ?? taskProgress;

  return (
    <Button
      variant='secondary'
      color='first'
      size='sm'
      {...props}
    >
      {progress && (
        <Lang
          id='navigation.popover_button_progress'
          params={[{ key: progress.name }, progress.pageNumber, progress.pageCount]}
        />
      )}
      <MenuHamburgerIcon
        className={cn({ [classes.burgerMenuIcon]: !!pageGroupProgress })}
        aria-hidden
      />
    </Button>
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

  if (pageIndex > -1) {
    return { name: currentGroup.name, pageNumber: pageIndex + 1, pageCount };
  }

  return { name: currentGroup.name, pageNumber: 1, pageCount: 1 };
}

function useTaskProgress(): NavigationButtonData | null {
  const taskGroups = usePageSettings().taskNavigation;

  const currentPageId = useNavigationParam('pageKey');
  const order = usePageOrder();
  const currentTaskId = useProcessTaskId();
  const isReceipt = useIsReceiptPage();

  const currentGroup = taskGroups.find(
    (group) => (group.type === 'receipt' && isReceipt) || ('taskId' in group && group.taskId === currentTaskId),
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
