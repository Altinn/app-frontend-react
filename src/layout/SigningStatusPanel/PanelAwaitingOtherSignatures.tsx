import React from 'react';

import { Button } from 'src/app-components/Button/Button';
import { Lang } from 'src/features/language/Lang';
import { SigningPanel } from 'src/layout/SigningStatusPanel/PanelSigning';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { CurrentUserStatus } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type AwaitingOtherSignaturesPanelProps = {
  node: LayoutNode<'SigningStatusPanel'>;
  currentUserStatus: Exclude<CurrentUserStatus, 'waiting'>;
};

export function AwaitingOtherSignaturesPanel({ node, currentUserStatus }: AwaitingOtherSignaturesPanelProps) {
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);

  const heading =
    textResourceBindings?.awaitingOtherSignaturesPanelTitle ?? 'signing.awaiting_other_signatures_panel_title';
  const descriptionNotSigning =
    textResourceBindings?.awaitingOtherSignaturesPanelDescriptionNotSigning ??
    'signing.awaiting_other_signatures_panel_description_not_signing';
  const descriptionSigned =
    textResourceBindings?.awaitingOtherSignaturesPanelDescriptionSigned ??
    'signing.awaiting_other_signatures_panel_description_signed';

  const hasSigned = currentUserStatus === 'signed';

  return (
    <SigningPanel
      node={node}
      variant={hasSigned ? 'success' : 'info'}
      heading={<Lang id={heading} />}
      description={<Lang id={hasSigned ? descriptionSigned : descriptionNotSigning} />}
      actionButton={
        <Button
          size='md'
          color='success'
          disabled
        >
          <Lang id='signing.submit_button' />
        </Button>
      }
    />
  );
}
