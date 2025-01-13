import React from 'react';

import { Button } from 'src/app-components/Button/Button';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
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
  const { langAsString } = useLanguage();

  function handleSubmit() {
    next?.({ nodeId });
  }

  const heading = langAsString(
    allHaveSigned ? 'signing.submit_panel_title_all_signed' : 'signing.submit_panel_title_not_all_signed',
  );

  const getDescription = () => {
    if (allHaveSigned) {
      return langAsString('signing.submit_panel_description_all_signed');
    }

    return currentUserStatus === 'notSigning'
      ? langAsString('signing.submit_panel_description_not_signing')
      : langAsString('signing.submit_panel_description_signed');
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
          <Lang id='signing.submit' />
        </Button>
      }
    />
  );
}
