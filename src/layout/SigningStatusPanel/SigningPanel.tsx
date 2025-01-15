import React, { useRef } from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { ErrorMessage, Heading, Modal, Paragraph } from '@digdir/designsystemet-react';

import { Button } from 'src/app-components/Button/Button';
import { Panel } from 'src/app-components/Panel/Panel';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import type { PanelProps } from 'src/app-components/Panel/Panel';

type SigningPanelProps = {
  heading: string;
  description?: string;
  variant?: PanelProps['variant'];
  actionButton: ReactElement<typeof Button>;
  errorMessage?: string;
};

export function SigningPanel({
  heading,
  description,
  variant = 'info',
  actionButton,
  errorMessage,
  children,
}: PropsWithChildren<SigningPanelProps>) {
  const canReject = useIsAuthorised()('reject');

  return (
    <Panel
      variant={variant}
      isOnBottom
      className={classes.signingPanel}
    >
      <div className={classes.contentContainer}>
        <Heading
          level={4}
          size='xs'
        >
          {heading}
        </Heading>
        {description && <Paragraph>{description}</Paragraph>}

        {children}
        <div>
          <div className={classes.buttonContainer}>
            {canReject && <Reject />}
            {actionButton}
          </div>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </div>
      </div>
    </Panel>
  );
}

function Reject() {
  const modalRef = useRef<HTMLDialogElement>(null);
  const { next, busy } = useProcessNavigation() ?? {};

  function handleReject() {
    next?.({ action: 'reject', nodeId: 'reject-button' });
  }

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button
          color='danger'
          variant='secondary'
          size='md'
        >
          Avbryt signering
        </Button>
      </Modal.Trigger>
      <Modal.Dialog ref={modalRef}>
        <Modal.Header>
          <Heading size='xs'>Avbryt signeringsprosessen</Heading>
        </Modal.Header>
        <Modal.Content>
          <Paragraph>
            Ved å avbryte signeringsprosessen vil alle signaturer bli slettet og alle delegerte tilganger trukket
            tilbake.
          </Paragraph>
        </Modal.Content>
        <Modal.Footer>
          <Button
            color='danger'
            disabled={busy}
            size='md'
            onClick={handleReject}
          >
            Avbryt signeringsprosessen
          </Button>
          <Button
            variant='secondary'
            size='md'
            onClick={() => modalRef.current?.close()}
          >
            Lukk
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </Modal.Root>
  );
}
