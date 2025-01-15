import React from 'react';

import { Button } from 'src/app-components/Button/Button';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { SigningPanel } from 'src/layout/SigningStatusPanel/SigningPanel';
import type { CurrentUserStatus } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';

type SubmitPanelProps = {
  nodeId: string;
  allHaveSigned: boolean;
  currentUserStatus: Exclude<CurrentUserStatus, 'waiting'>;
  texts: {
    titleReadyForSubmit?: string;
    titleNotReadyForSubmit?: string;
    descriptionReadyForSubmit?: string;
    descriptionNotSigning?: string;
    descriptionSigned?: string;
  };
};

export function SubmitPanel({
  nodeId,
  allHaveSigned,
  currentUserStatus,
  texts: {
    titleReadyForSubmit = 'signing.submit_panel_title_ready_for_submit',
    titleNotReadyForSubmit = 'signing.submit_panel_title_not_ready_for_submit',
    descriptionReadyForSubmit = 'signing.submit_panel_description_ready_for_submit',
    descriptionNotSigning = 'signing.submit_panel_description_not_signing',
    descriptionSigned = 'signing.submit_panel_description_signed',
  },
}: SubmitPanelProps) {
  const { next, busy } = useProcessNavigation() ?? {};
  const { langAsString } = useLanguage();

  function handleSubmit() {
    next?.({ nodeId });
  }

  const heading = langAsString(allHaveSigned ? titleReadyForSubmit : titleNotReadyForSubmit);

  function getDescription() {
    if (allHaveSigned) {
      return langAsString(descriptionReadyForSubmit);
    }

    return langAsString(currentUserStatus === 'notSigning' ? descriptionNotSigning : descriptionSigned);
  }

  return (
    <SigningPanel
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
