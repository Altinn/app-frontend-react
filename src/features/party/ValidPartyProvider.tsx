import React from 'react';
import type { PropsWithChildren } from 'react';

import { useMutation } from '@tanstack/react-query';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { createStrictContext } from 'src/core/contexts/context';
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

const { Provider } = createStrictContext<undefined>({
  name: 'ValidParty',
});

/**
 * This provider makes sure the current party is valid and allowed to instantiate. If not, it will
 * show the user an error message or redirect to the party selection page.
 */
export function ValidPartyProvider({ children }: PropsWithChildren) {
  // const { data, mutate } = usePartyValidationMutation();

  // React.useEffect(() => {
  //   if (!selectedParty) {
  //     return;
  //   }
  //
  //   mutate(selectedParty.partyId);
  // }, [selectedParty, mutate]);
  //
  // if (data?.valid === false) {
  //   if (data.validParties?.length === 0) {
  //     return <NoValidPartiesError />;
  //   }
  //   return <Navigate to={`/partyselection/${HttpStatusCodes.Forbidden}`} />;
  // }

  return <Provider value={undefined}>{children}</Provider>;
}
