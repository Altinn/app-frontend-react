import React from 'react';

import { Button } from 'src/app-components/Button/Button';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { SigningPanel } from 'src/layout/SigningStatusPanel/SigningPanel';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { CurrentUserStatus } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

type SubmitPanelProps = {
  node: BaseLayoutNode<'SigningStatusPanel'>;
  allHaveSigned: boolean;
  currentUserStatus: Exclude<CurrentUserStatus, 'waiting'>;
};

export function SubmitPanel({ node, allHaveSigned, currentUserStatus }: SubmitPanelProps) {
  const { next, busy } = useProcessNavigation() ?? {};
  const { langAsString } = useLanguage();
  const { id: nodeId, textResourceBindings } = useNodeItem(node);

  function handleSubmit() {
    next?.({ nodeId });
  }

  const titleReadyForSubmit =
    textResourceBindings?.submit_panel_title_ready_for_submit ?? 'signing.submit_panel_title_ready_for_submit';
  const titleNotReadyForSubmit =
    textResourceBindings?.submit_panel_title_not_ready_for_submit ?? 'signing.submit_panel_title_not_ready_for_submit';
  const descriptionReadyForSubmit =
    textResourceBindings?.submit_panel_description_ready_for_submit ??
    'signing.submit_panel_description_ready_for_submit';
  const descriptionNotSigning =
    textResourceBindings?.submit_panel_description_not_signing ?? 'signing.submit_panel_description_not_signing';
  const descriptionSigned =
    textResourceBindings?.submit_panel_description_signed ?? 'signing.submit_panel_description_signed';

  const heading = langAsString(allHaveSigned ? titleReadyForSubmit : titleNotReadyForSubmit);

  function getDescription() {
    if (allHaveSigned) {
      return langAsString(descriptionReadyForSubmit);
    }

    return langAsString(currentUserStatus === 'notSigning' ? descriptionNotSigning : descriptionSigned);
  }

  return (
    <SigningPanel
      node={node}
      variant={currentUserStatus === 'signed' ? 'success' : 'info'}
      heading={heading}
      description={getDescription()}
      actionButton={
        <Button
          onClick={handleSubmit}
          size='md'
          color='success'
          disabled={!allHaveSigned || busy}
        >
          <Lang id='signing.submit_button' />
        </Button>
      }
    />
  );
}
