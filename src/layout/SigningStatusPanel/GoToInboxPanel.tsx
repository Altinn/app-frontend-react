import React from 'react';
import { useParams } from 'react-router-dom';

import { Link } from '@digdir/designsystemet-react';

import { Button } from 'src/app-components/Button/Button';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { SigningPanel } from 'src/layout/SigningStatusPanel/SigningPanel';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import { returnUrlToMessageBox } from 'src/utils/urls/urlHelper';
import type { CurrentUserStatus } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';

export function GoToInboxPanel({
  currentUserStatus,
}: {
  currentUserStatus: Extract<CurrentUserStatus, 'signed' | 'notSigning'>;
}) {
  const { langAsString } = useLanguage();
  const partyId = Number(useParams().partyId);

  const hasSigned = currentUserStatus === 'signed';

  return (
    <SigningPanel
      variant={hasSigned ? 'success' : 'info'}
      heading={langAsString(
        hasSigned ? 'signing.go_to_inbox_panel_title_has_signed' : 'signing.go_to_inbox_panel_title_not_signed',
      )}
      description={langAsString(
        hasSigned
          ? 'signing.go_to_inbox_panel_description_has_signed'
          : 'signing.go_to_inbox_panel_description_not_signed.',
      )}
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
            <Lang id='signing.go_to_inbox' />
          </Link>
        </Button>
      }
    />
  );
}
