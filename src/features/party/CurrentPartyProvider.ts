import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { createStrictQueryContext } from 'src/features/contexts/queryContext';
import { PartyActions } from 'src/features/party/partySlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import type { IParty } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const useCurrentPartyQuery = (enabled: boolean) => {
  const dispatch = useAppDispatch();
  const parties = useAppSelector((state) => state.party.parties);

  const { fetchCurrentParty } = useAppQueries();
  return useQuery({
    enabled,
    queryKey: ['fetchUseCurrentParty'],
    queryFn: () => fetchCurrentParty(),
    onSuccess: (currentParty) => {
      dispatch(PartyActions.selectPartyFulfilled({ party: currentParty }));
      if ((!parties || parties.length === 0) && currentParty) {
        dispatch(PartyActions.getPartiesFulfilled({ parties: [currentParty] }));
      }
    },
    onError: (error: HttpClientError) => {
      window.logError('Fetching current party failed:\n', error);
    },
  });
};

const { useCtx, Provider } = createStrictQueryContext<IParty | undefined>({
  name: 'CurrentParty',
  queryHook: useCurrentPartyQuery,
});

export const CurrentPartyProvider = Provider;
export const useCurrentParty = useCtx;
