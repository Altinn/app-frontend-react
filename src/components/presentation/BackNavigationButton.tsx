import React from 'react';

import { Button, Spinner } from '@digdir/designsystemet-react';
import { Left } from '@navikt/ds-icons';
import { skipToken, useQuery } from '@tanstack/react-query';
import cn from 'classnames';

import classes from 'src/components/presentation/BackNavigationButton.module.css';
import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { useIsSubformPage } from 'src/features/routing/AppRoutingContext';
import { useIsMobile } from 'src/hooks/useDeviceWidths';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { returnUrlToMessagebox } from 'src/utils/urls/urlHelper';

export function BackNavigationButton(props: Parameters<typeof Button>[0]) {
  const party = useCurrentParty();
  const isMobile = useIsMobile();
  const isSubform = useIsSubformPage();
  const { langAsString } = useLanguage();
  const { exitSubform } = useNavigatePage();
  const { returnUrl, fetchingReturnUrl } = useReturnUrl();

  const handleBackToInbox = async () => {
    const messageBoxUrl = returnUrlToMessagebox(window.location.host, party?.partyId);
    messageBoxUrl && window.location.assign(messageBoxUrl);
  };

  const handleReturn = () => {
    returnUrl && window.location.assign(returnUrl);
  };

  if (fetchingReturnUrl) {
    return (
      <Spinner
        style={{ marginLeft: 8 }}
        size='sm'
        title={langAsString('general.loading')}
      />
    );
  }

  return (
    <Button
      onClick={isSubform ? exitSubform : returnUrl ? handleReturn : handleBackToInbox}
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
      {isSubform ? (
        <Lang id={isMobile ? 'navigation.main_form' : 'navigation.back_to_main_form'} />
      ) : returnUrl ? (
        <Lang id='navigation.back' />
      ) : (
        <Lang id={isMobile ? 'navigation.inbox' : 'navigation.back_to_inbox'} />
      )}
    </Button>
  );
}

function useReturnUrl() {
  const { fetchReturnUrl } = useAppQueries();
  const queryParameterReturnUrl = new URLSearchParams(window.location.search).get('returnUrl');

  const { data, isFetching } = useQuery({
    queryKey: ['returnUrl', queryParameterReturnUrl],
    queryFn: queryParameterReturnUrl ? () => fetchReturnUrl(queryParameterReturnUrl) : skipToken,
  });

  return { returnUrl: data, fetchingReturnUrl: isFetching };
}
