import React from 'react';

import { Button } from 'src/app-components/Button/Button';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { SigningPanel } from 'src/layout/SigningStatusPanel/PanelSigning';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { CurrentUserStatus } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

type AwaitingOtherSignaturesPanelProps = {
  node: BaseLayoutNode<'SigningStatusPanel'>;
  currentUserStatus: Exclude<CurrentUserStatus, 'waiting'>;
};

export function AwaitingOtherSignaturesPanel({ node, currentUserStatus }: AwaitingOtherSignaturesPanelProps) {
  const { textResourceBindings } = useNodeItem(node);
  const { langAsString } = useLanguage();

  const heading =
    textResourceBindings?.awaiting_other_signatures_panel_title ?? 'signing.awaiting_other_signatures_panel_title';
  const descriptionNotSigning =
    textResourceBindings?.awaiting_other_signatures_panel_description_not_signing ??
    'signing.awaiting_other_signatures_panel_description_not_signing';
  const descriptionSigned =
    textResourceBindings?.awaiting_other_signatures_panel_description_signed ??
    'signing.awaiting_other_signatures_panel_description_signed';

  const hasSigned = currentUserStatus === 'signed';

  return (
    <SigningPanel
      node={node}
      variant={hasSigned ? 'success' : 'info'}
      heading={langAsString(heading)}
      description={langAsString(hasSigned ? descriptionSigned : descriptionNotSigning)}
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
