import React, { useEffect, useRef, useState } from 'react';
import type { JSX, PropsWithChildren, ReactNode } from 'react';

import { Button, Modal, Popover } from '@digdir/designsystemet-react';
import { MenuHamburgerIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { useUiConfigContext } from 'src/features/form/layout/UiConfigContext';
import { useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { Lang } from 'src/features/language/Lang';
import { AppNavigation, AppNavigationHeading } from 'src/features/navigation/AppNavigation';
import classes from 'src/features/navigation/PopoverNavigation.module.css';
import {
  CHECK_USE_HAS_GROUPED_NAVIGATION_ERROR,
  SIDEBAR_BREAKPOINT,
  useHasGroupedNavigation,
} from 'src/features/navigation/utils';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { useBrowserWidth, useIsMobile } from 'src/hooks/useDeviceWidths';

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
  const currentPageId = useNavigationParam('pageKey');
  const groups = useLayoutSettings().pages.groups;

  if (!groups || !currentPageId) {
    throw CHECK_USE_HAS_GROUPED_NAVIGATION_ERROR;
  }

  const currentGroup = groups.find((group) => group.order.includes(currentPageId));
  const currentGroupLength = currentGroup?.order.length;
  const currentGroupIndex = currentGroup?.order.indexOf(currentPageId);
  const hasCurrentGroup =
    currentGroup && typeof currentGroupIndex === 'number' && typeof currentGroupLength === 'number';

  return (
    <Button
      variant='secondary'
      color='first'
      size='sm'
      {...props}
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
  );
}
