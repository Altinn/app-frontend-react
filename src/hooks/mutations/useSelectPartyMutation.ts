import { useMutation } from '@tanstack/react-query';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { PartyActions } from 'src/features/party/partySlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IParty } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

export const useSelectPartyMutation = () => {
  const { doSelectParty } = useAppMutations();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (party: IParty) => doSelectParty.call(party.partyId),
    onSuccess: (_, party) => {
      dispatch(PartyActions.selectPartyFulfilled({ party }));
    },
    onError: (error: HttpClientError) => {
      window.logError('Selecting party failed:\n', error);
    },
  });
};
