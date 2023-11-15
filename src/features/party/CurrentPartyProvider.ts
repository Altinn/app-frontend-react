import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/contexts/appQueriesContext';
import { useAllowAnonymousIs } from 'src/features/applicationMetadata/getAllowAnonymous';
import { createLaxQueryContext } from 'src/features/contexts/queryContext';
import { PartyActions } from 'src/features/party/partySlice';
import { useAlwaysPromptForParty } from 'src/hooks/useAlwaysPromptForParty';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import type { IParty } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const useCurrentPartyQuery = () => {
  const dispatch = useAppDispatch();
  const parties = useAppSelector((state) => state.party.parties);
  const alwaysPromptForParty = useAlwaysPromptForParty();
  const shouldFetchProfile = useAllowAnonymousIs(false);
  const enabled = alwaysPromptForParty === false && shouldFetchProfile;

  const { fetchCurrentParty } = useAppQueries();
  const utils = useQuery({
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

  return { ...utils, enabled };
};

const { useCtx, Provider } = createLaxQueryContext<IParty>({
  name: 'CurrentParty',
  useQuery: useCurrentPartyQuery,
});

export const CurrentPartyProvider = Provider;
export const useCurrentParty = useCtx;
