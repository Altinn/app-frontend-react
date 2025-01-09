import React from 'react';

import { Button } from '@digdir/designsystemet-react';
import { Left } from '@navikt/ds-icons';
import cn from 'classnames';

import classes from 'src/components/presentation/BackToInboxButton.module.css';
import { Lang } from 'src/features/language/Lang';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { useIsMobile } from 'src/hooks/useDeviceWidths';
import { isLocalTest, isStudioPreview } from 'src/utils/isDev';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { getRedirectUrl } from 'src/utils/urls/appUrlHelper';
import { returnUrlToMessagebox } from 'src/utils/urls/urlHelper';

export function BackToInboxButton(props: Parameters<typeof Button>[0]) {
  const party = useCurrentParty();
  const isMobile = useIsMobile();

  const handleBackToInbox = async () => {
    if (isStudioPreview()) {
      return;
    }
    if (isLocalTest()) {
      window.location.assign(window.location.origin);
      return;
    }

    const queryParameterReturnUrl = new URLSearchParams(window.location.search).get('returnUrl');
    const messageBoxUrl = returnUrlToMessagebox(window.location.origin, party?.partyId);

    if (queryParameterReturnUrl) {
      const returnUrl =
        (await httpGet<string>(getRedirectUrl(queryParameterReturnUrl)).catch((_e) => null)) ?? messageBoxUrl;
      returnUrl && window.location.assign(returnUrl);
    } else if (messageBoxUrl) {
      window.location.assign(messageBoxUrl);
    }
  };
  return (
    <Button
      onClick={handleBackToInbox}
      variant='tertiary'
      color='second'
      size='sm'
      {...props}
      className={cn(classes.inboxButton, props.className)}
    >
      <Left
        fontSize='1rem'
        aria-hidden
      />
      <Lang id={isMobile ? 'navigation.inbox' : 'navigation.back_to_inbox'} />
    </Button>
  );
}
