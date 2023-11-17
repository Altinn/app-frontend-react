import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { useMutation } from '@tanstack/react-query';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { createContext } from 'src/core/contexts/context';
import { Loader } from 'src/core/loading/Loader';
import { NoValidPartiesError } from 'src/features/instantiate/containers/NoValidPartiesError';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { HttpStatusCodes } from 'src/utils/network/networking';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const usePartyValidationMutation = () => {
  const { doPartyValidation } = useAppMutations();
  return useMutation((partyId: string) => doPartyValidation.call(partyId), {
    onSuccess: (data) => {
      doPartyValidation.setLastResult(data);
    },
    onError: (error: HttpClientError) => {
      window.logErrorOnce('Server did not respond correctly when asked if party was valid to instantiate:\n', error);
    },
  });
};

const { Provider, useHasProvider } = createContext<undefined>({
  name: 'ValidParty',
  required: false,
  default: undefined,
});

/**
 * This provider makes sure the current party is valid and allowed to instantiate. If not, it will
 * show the user an error message or redirect to the party selection page.
 */
export function ValidPartyProvider({ children }: PropsWithChildren) {
  const currentParty = useCurrentParty();
  const { data, mutate } = usePartyValidationMutation();

  useEffect(() => {
    if (!currentParty.party) {
      return;
    }

    mutate(currentParty.party.partyId);
  }, [currentParty, mutate]);

  if (!currentParty) {
    return <Loader reason='waiting-to-validate-party' />;
  }

  if (data?.valid === false) {
    if (data.validParties?.length === 0) {
      return <NoValidPartiesError />;
    }
    return <Navigate to={`/party-selection/${HttpStatusCodes.Forbidden}`} />;
  }

  return <Provider value={undefined}>{children}</Provider>;
}

/**
 * This hook returns true if the current party is valid and allowed to instantiate.
 */
export const usePartyCanInstantiate = () => useHasProvider();
