import React, { useRef } from 'react';
import type { PropsWithChildren, ReactElement } from 'react';

import { ErrorMessage, Heading, Modal, Paragraph } from '@digdir/designsystemet-react';

import { Button } from 'src/app-components/Button/Button';
import { Panel } from 'src/app-components/Panel/Panel';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PanelProps } from 'src/app-components/Panel/Panel';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

type SigningPanelProps = {
  node: BaseLayoutNode<'SigningStatusPanel'>;
  heading: string;
  description?: string;
  variant?: PanelProps['variant'];
  actionButton: ReactElement<typeof Button>;
  errorMessage?: string;
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
            {canReject && <Reject node={node} />}
            {actionButton}
          </div>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </div>
      </div>
    </Panel>
  );
}

type RejectTextProps = {
  node: BaseLayoutNode<'SigningStatusPanel'>;
};

function Reject({ node }: RejectTextProps) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const { next, busy } = useProcessNavigation() ?? {};
  const { textResourceBindings } = useNodeItem(node);

  const modalTitle = textResourceBindings?.reject_modal_title ?? 'signing.reject_modal_title';
  const modalDescription = textResourceBindings?.reject_modal_description ?? 'signing.reject_modal_description';
  const modalButton = textResourceBindings?.reject_modal_button ?? 'signing.reject_modal_button';
  const modalTriggerButton = textResourceBindings?.reject_modal_trigger_button ?? 'signing.reject_modal_trigger_button';

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
          <Lang id={modalTriggerButton} />
        </Button>
      </Modal.Trigger>
      <Modal.Dialog ref={modalRef}>
        <Modal.Header>
          <Heading size='xs'>
            <Lang id={modalTitle} />
          </Heading>
        </Modal.Header>
        <Modal.Content>
          <Paragraph>
            <Lang id={modalDescription} />
          </Paragraph>
        </Modal.Content>
        <Modal.Footer>
          <Button
            color='danger'
            disabled={busy}
            size='md'
            onClick={handleReject}
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
