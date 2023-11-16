import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { useAllowAnonymousIs } from 'src/features/applicationMetadata/getAllowAnonymous';
import { useParties } from 'src/features/party/PartiesProvider';
import { PartyActions } from 'src/features/party/partySlice';
import { useAlwaysPromptForParty } from 'src/hooks/useAlwaysPromptForParty';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { IParty } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const useCurrentPartyQuery = () => {
  const dispatch = useAppDispatch();
  const parties = useParties();
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

const { useCtx, Provider } = delayedContext(() =>
  createQueryContext<IParty | undefined, false>({
    name: 'CurrentParty',
    required: false,
    default: undefined,
    query: useCurrentPartyQuery,
  }),
);

export const CurrentPartyProvider = Provider;
export const useCurrentParty = () => useCtx();
