import React, { useEffect } from 'react';

import { Loader } from 'src/core/loading/Loader';
import { InstantiateValidationError } from 'src/features/instantiate/containers/InstantiateValidationError';
import { MissingRolesError } from 'src/features/instantiate/containers/MissingRolesError';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { useInstantiation } from 'src/features/instantiate/InstantiationContext';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { AltinnPalette } from 'src/theme/altinnAppTheme';
import { changeBodyBackground } from 'src/utils/bodyStyling';
import { isAxiosError } from 'src/utils/isAxiosError';
import { HttpStatusCodes } from 'src/utils/network/networking';

export const InstantiateContainer = () => {
  changeBodyBackground(AltinnPalette.greyLight);
  const party = useCurrentParty();
  const instantiation = useInstantiation();

  // If we render this again before the cleanup timeout has run, we should clear it to avoid the cleanup.
  instantiation.cancelClearTimeout();

  // Clear the instantiation when the component is unmounted, to allow users to start a new instance later
  const clear = instantiation.clear;
  useEffect(() => () => clear(), [clear]);

  useEffect(() => {
    const shouldCreateInstance = !!party;
    if (shouldCreateInstance) {
      instantiation.instantiate(party.partyId);
    }
  }, [instantiation, party]);

  if (isAxiosError(instantiation.error) && instantiation.error.response?.status === HttpStatusCodes.Forbidden) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = (instantiation.error.response?.data as any)?.message;
    if (message) {
      return <InstantiateValidationError message={message} />;
    }
    return <MissingRolesError />;
  } else if (instantiation.error) {
    return <UnknownError />;
  }

  return <Loader reason='instantiating' />;
};
