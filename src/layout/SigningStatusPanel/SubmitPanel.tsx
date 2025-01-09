import React from 'react';

import { Button } from 'src/app-components/Button/Button';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { SigningPanel } from 'src/layout/SigningStatusPanel/SigningPanel';
import type { CurrentUserStatus } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';

export function SubmitPanel({
  nodeId,
  allHaveSigned,
  currentUserStatus,
}: {
  nodeId: string;
  allHaveSigned: boolean;
  currentUserStatus: Exclude<CurrentUserStatus, 'waiting'>;
}) {
  const { next, busy } = useProcessNavigation() ?? {};

  function handleSubmit() {
    next?.({ nodeId });
  }

  const heading = allHaveSigned ? 'Det er klart for å sende inn skjemaet' : 'Venter på signaturer';
  const getDescription = () => {
    if (allHaveSigned) {
      return 'Alle har signert! Velg send inn skjemaet for å fullføre.';
    }

    return currentUserStatus === 'notSigning'
      ? 'Når alle har signert kan du sende inn skjemaet.'
      : 'Takk for at du har signert! Når alle har signert kan du sende inn skjemaet.';
  };

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
          Send inn skjemaet
        </Button>
      }
    />
  );
}
