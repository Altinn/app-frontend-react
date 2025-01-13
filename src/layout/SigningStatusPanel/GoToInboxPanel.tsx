import React from 'react';
import { useParams } from 'react-router-dom';

import { Link } from '@digdir/designsystemet-react';

import { Button } from 'src/app-components/Button/Button';
import { SigningPanel } from 'src/layout/SigningStatusPanel/SigningPanel';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import { returnUrlToMessageBox } from 'src/utils/urls/urlHelper';
import type { CurrentUserStatus } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';

export function GoToInboxPanel({
  currentUserStatus,
}: {
  currentUserStatus: Extract<CurrentUserStatus, 'signed' | 'notSigning'>;
}) {
  const partyId = Number(useParams().partyId);

  const hasSigned = currentUserStatus === 'signed';

  return (
    <SigningPanel
      variant={hasSigned ? 'success' : 'info'}
      heading={hasSigned ? 'Du har signert skjemaet' : 'Ingenting å signere'}
      description={
        hasSigned
          ? 'Alt i orden! Du kan nå gå tilbake til innboksen.'
          : 'Du har ikke tilgang til å signere dette skjemaet.'
      }
      actionButton={
        <Button
          color='first'
          size='md'
          asChild
        >
          <Link
            href={returnUrlToMessageBox(window.location.origin, partyId) ?? '#'}
            className={classes.buttonLink}
          >
            Gå til innboksen
          </Link>
        </Button>
      }
    />
  );
}
