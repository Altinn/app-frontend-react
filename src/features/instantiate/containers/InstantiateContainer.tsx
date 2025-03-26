import React, { useEffect } from 'react';

import { Loader } from 'src/core/loading/Loader';
import { InstantiateValidationError } from 'src/features/instantiate/containers/InstantiateValidationError';
import { MissingRolesError } from 'src/features/instantiate/containers/MissingRolesError';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { useInstantiateMutation } from 'src/features/instantiate/InstantiationContext';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { AltinnPalette } from 'src/theme/altinnAppTheme';
import { changeBodyBackground } from 'src/utils/bodyStyling';
import { isAxiosError } from 'src/utils/isAxiosError';
import { HttpStatusCodes } from 'src/utils/network/networking';

export const InstantiateContainer = () => {
  changeBodyBackground(AltinnPalette.greyLight);
  const party = useCurrentParty();
  const { mutate: instantiate, error, isPending } = useInstantiateMutation();

  useEffect(() => {
    const shouldCreateInstance = !!party;
    if (shouldCreateInstance) {
      instantiate(party.partyId);
    }
  }, [instantiate, party]);

  if (isPending) {
    return <Loader reason='instantiating' />;
  }

  if (isAxiosError(error)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = (error.response?.data as any)?.message;
    if (error.response?.status === HttpStatusCodes.Forbidden) {
      if (message) {
        return <InstantiateValidationError message={message} />;
      }
      return <MissingRolesError />;
    }

    return <UnknownError />;
  }

  return <Loader reason='instantiating' />;
};
