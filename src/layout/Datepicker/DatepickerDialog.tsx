import React, { useEffect, useRef } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';

import { Modal, Popover } from '@digdir/designsystemet-react';

import { useIsMobile } from 'src/hooks/useDeviceWidths';
import styles from 'src/layout/Datepicker/Calendar.module.css';

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
      <Modal.Context>
        <Modal.Trigger asChild>{trigger}</Modal.Trigger>
        <Modal
          role='dialog'
          ref={modalRef}
          backdropClose
          style={{ width: 'fit-content', minWidth: 'fit-content' }}
        >
          {children}
        </Modal>
      </Modal.Context>
    );
  }
  return (
    <Popover.Context>
      <Popover.Trigger
        onClick={() => setIsDialogOpen(!isDialogOpen)}
        asChild
      >
        {trigger}
      </Popover.Trigger>
      <Popover
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        size='lg'
        placement='top'
        className={styles.calendarWrapper}
        aria-modal
        autoFocus={true}
      >
        {children}
      </Popover>
    </Popover.Context>
  );
}
