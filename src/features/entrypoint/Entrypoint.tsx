import React from 'react';
import { Navigate } from 'react-router-dom';

import { Form } from 'src/components/form/Form';
import { PresentationComponent } from 'src/components/presentation/Presentation';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { FormProvider } from 'src/features/form/FormContext';
import { InstantiateContainer } from 'src/features/instantiate/containers/InstantiateContainer';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { useCurrentParty, useCurrentPartyIsValid } from 'src/features/party/PartiesProvider';
import { useAllowAnonymousIs } from 'src/features/stateless/getAllowAnonymous';
import { usePromptForParty } from 'src/hooks/usePromptForParty';
import { PresentationType } from 'src/types';
import { useIsStatelessApp } from 'src/utils/useIsStatelessApp';
import type { ShowTypes } from 'src/features/applicationMetadata';

export function Entrypoint() {
  const applicationMetadata = useApplicationMetadata();
  const isStateless = useIsStatelessApp();
  const show: ShowTypes = applicationMetadata.onEntry?.show ?? 'new-instance';
  const party = useCurrentParty();
  const partyIsValid = useCurrentPartyIsValid();
  const allowAnonymous = useAllowAnonymousIs(true);
  const alwaysPromptForParty = usePromptForParty();

  const isMissingParty = party === undefined && !allowAnonymous;
  if (partyIsValid === false || isMissingParty) {
    const extraInfo = alwaysPromptForParty ? 'explained' : partyIsValid === false && party ? 'error' : '';
    return (
      <Navigate
        to={`/party-selection/${extraInfo}`}
        replace={true}
      />
    );
  }

  if (show === 'new-instance') {
    return <InstantiateContainer />;
  }

  if (show === 'select-instance') {
    return (
      <Navigate
        to={'/instance-selection/'}
        replace={true}
      />
    );
  }

  // Stateless view
  if (isStateless) {
    return (
      <FormProvider>
        <PresentationComponent type={PresentationType.Stateless}>
          <Form />
        </PresentationComponent>
      </FormProvider>
    );
  }

  window.logErrorOnce('Unknown applicationMetadata.onEntry type:', show);
  return <UnknownError />;
}
