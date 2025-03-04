import React, { useEffect, useRef } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';

import { Dialog, Popover } from '@digdir/designsystemet-react';

import styles from 'src/app-components/Datepicker/Calendar.module.css';
import { useIsMobile } from 'src/hooks/useDeviceWidths';

export function DatePickerDialog({
  children,
  trigger,
  isDialogOpen,
  setIsDialogOpen,
}: PropsWithChildren<{ trigger: ReactNode; isDialogOpen: boolean; setIsDialogOpen: (open: boolean) => void }>) {
  const isMobile = useIsMobile();
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    isDialogOpen && modalRef.current?.showModal();
    !isDialogOpen && modalRef.current?.close();
  }, [isMobile, isDialogOpen]);

  if (isMobile) {
    return (
      <Dialog.TriggerContext>
        <Dialog.Trigger asChild={true}>{trigger}</Dialog.Trigger>
        <Dialog
          ref={modalRef}
          role='dialog'
          aria-hidden={!isDialogOpen}
          closedby='any'
          modal
          style={{ width: 'fit-content', minWidth: 'fit-content' }}
          onClose={() => setIsDialogOpen(false)}
        >
          {children}
        </Dialog>
      </Dialog.TriggerContext>
    );
  }
  return (
    <Popover.TriggerContext>
      <Popover.Trigger asChild={true}>{trigger}</Popover.Trigger>
      <Popover
        className={styles.calendarWrapper}
        aria-modal
        aria-hidden={!isDialogOpen}
        role='dialog'
        open={isDialogOpen}
        data-size='lg'
        placement='top'
        autoFocus={true}
        onClose={() => setIsDialogOpen(false)}
      >
        {children}
      </Popover>
    </Popover.TriggerContext>
  );
}
