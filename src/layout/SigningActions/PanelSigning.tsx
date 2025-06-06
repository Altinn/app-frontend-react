import React, { useRef } from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { ErrorMessage, Heading, Modal, Paragraph } from '@digdir/designsystemet-react';
import { useIsMutating, useMutation } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { Panel } from 'src/app-components/Panel/Panel';
import { useIsAuthorized } from 'src/features/instance/ProcessContext';
import { useProcessNext } from 'src/features/instance/useProcessNext';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/SigningActions/SigningActions.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PanelProps } from 'src/app-components/Panel/Panel';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type SigningPanelProps = {
  node: LayoutNode<'SigningActions'>;
  heading: React.ReactElement;
  description?: React.ReactElement;
  variant?: PanelProps['variant'];
  actionButton?: ReactElement<typeof Button>;
  errorMessage?: React.ReactElement;
};

export function SigningPanel({
  node,
  heading,
  description,
  variant = 'info',
  actionButton,
  errorMessage,
  children,
}: PropsWithChildren<SigningPanelProps>) {
  const canReject = useIsAuthorized()('reject');

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
            {actionButton}
            {canReject && <RejectButton node={node} />}
          </div>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </div>
      </div>
    </Panel>
  );
}

type RejectTextProps = {
  node: LayoutNode<'SigningActions'>;
};

function RejectButton({ node }: RejectTextProps) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const rejectButtonRef = useRef<HTMLButtonElement>(null);
  const processNext = useProcessNext();
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);

  const modalTitle = textResourceBindings?.rejectModalTitle ?? 'signing.reject_modal_title';
  const modalDescription = textResourceBindings?.rejectModalDescription ?? 'signing.reject_modal_description';
  const modalButton = textResourceBindings?.rejectModalButton ?? 'signing.reject_modal_button';
  const modalTriggerButton = textResourceBindings?.rejectModalTriggerButton ?? 'signing.reject_modal_trigger_button';

  const isAnyProcessing = useIsMutating() > 0;

  const { mutate: handleReject, isPending: isRejecting } = useMutation({
    mutationFn: async () => {
      if (rejectButtonRef.current) {
        rejectButtonRef.current.disabled = true;
      }
      await processNext({ action: 'reject' });
    },
    onSettled: () => {
      if (rejectButtonRef.current) {
        rejectButtonRef.current.disabled = false;
      }
    },
  });

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button
          color='danger'
          variant='secondary'
          size='md'
        >
          <Lang id={modalTriggerButton} />
        </Button>
      </Modal.Trigger>
      <Modal.Dialog ref={modalRef}>
        <Modal.Header>
          <Lang id={modalTitle} />
        </Modal.Header>
        <Modal.Content>
          <Paragraph>
            <Lang id={modalDescription} />
          </Paragraph>
        </Modal.Content>
        <Modal.Footer>
          <Button
            color='danger'
            disabled={isAnyProcessing}
            size='md'
            ref={rejectButtonRef}
            isLoading={isRejecting}
            onClick={() => handleReject()}
          >
            <Lang id={modalButton} />
          </Button>
          <Button
            variant='secondary'
            size='md'
            onClick={() => modalRef.current?.close()}
          >
            <Lang id='general.close' />
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </Modal.Root>
  );
}
