import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';

import { useAppMutations, useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { createContext } from 'src/core/contexts/context';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { Loader } from 'src/core/loading/Loader';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { NoValidPartiesError } from 'src/features/instantiate/containers/NoValidPartiesError';
import { flattenParties } from 'src/features/party/partyUtils';
import { useShouldFetchProfile } from 'src/features/profile/ProfileProvider';
import type { IParty } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const partyQueryKeys = {
  all: ['parties'] as const,
  allowedToInstantiate: () => [...partyQueryKeys.all, 'allowedToInstantiate'] as const,
};

// Also used for prefetching @see appPrefetcher.ts, partyPrefetcher.ts
export function usePartiesQueryDef(enabled: boolean) {
  const { fetchPartiesAllowedToInstantiate } = useAppQueries();
  return {
    queryKey: partyQueryKeys.allowedToInstantiate(),
    queryFn: fetchPartiesAllowedToInstantiate,
    enabled,
  };
}

const usePartiesAllowedToInstantiateQuery = () => {
  const enabled = useShouldFetchProfile();

  const utils = useQuery(usePartiesQueryDef(enabled));

  useEffect(() => {
    utils.error && window.logError('Fetching parties failed:\n', utils.error);
  }, [utils.error]);

  return {
    ...utils,
    enabled,
  };
};

// Also used for prefetching @see appPrefetcher.ts, partyPrefetcher.ts
export function useCurrentPartyQueryDef(enabled: boolean) {
  const { fetchCurrentParty } = useAppQueries();
  return {
    queryKey: ['fetchUseCurrentParty', enabled],
    queryFn: fetchCurrentParty,
    enabled,
  };
}

const useCurrentPartyQuery = (enabled: boolean) => {
  const query = useQuery(useCurrentPartyQueryDef(enabled));

  useEffect(() => {
    query.error && window.logError('Fetching current party failed:\n', query.error);
  }, [query.error]);

  return query;
};

const useSetCurrentPartyMutation = () => {
  const { doSetCurrentParty } = useAppMutations();
  return useMutation({
    mutationKey: ['doSetCurrentParty'],
    mutationFn: (party: IParty) => doSetCurrentParty(party.partyId),
    onError: (error: HttpClientError) => {
      window.logError('Setting current party failed:\n', error);
    },
  });
};

const { Provider: PartiesProvider, useCtx: usePartiesAllowedToInstantiateCtx } = delayedContext(() =>
  createQueryContext<IParty[] | undefined, false>({
    name: 'Parties',
    required: false,
    default: undefined,
    query: usePartiesAllowedToInstantiateQuery,
  }),
);

interface CurrentParty {
  party: IParty | undefined;
  currentIsValid: boolean | undefined;
  userHasSelectedParty: boolean | undefined;
  setUserHasSelectedParty: (hasSelected: boolean) => void;
  setParty: (party: IParty) => Promise<IParty | undefined>;
}

const { Provider: RealCurrentPartyProvider, useCtx: useCurrentPartyCtx } = createContext<CurrentParty>({
  name: 'CurrentParty',
  required: false,
  default: {
    party: undefined,
    currentIsValid: undefined,
    userHasSelectedParty: undefined,
    setUserHasSelectedParty: () => {
      throw new Error('CurrentPartyProvider not initialized');
    },
    setParty: () => {
      throw new Error('CurrentPartyProvider not initialized');
    },
  },
});

/*
 * This provider is used to manage the selected party and its validity _before_ any instance is present.
 * That is, the selected party should only be used to determine the party that is used to instantiate an app or to select from previously instantiated apps.
 * When the user is filling out an app, the current party is always the user's party, found in the profile, filling out the form on behalf of the instance owner.
 */
const CurrentPartyProvider = ({ children }: PropsWithChildren) => {
  const validParties = useValidParties();
  const [sentToMutation, setSentToMutation] = useState<IParty | undefined>(undefined);
  const { mutateAsync, data: dataFromMutation, error: errorFromMutation } = useSetCurrentPartyMutation();
  const { data: partyFromQuery, isLoading, error: errorFromQuery } = useCurrentPartyQuery(true);
  const [userHasSelectedParty, setUserHasSelectedParty] = useState(false);

  if (isLoading) {
    return <Loader reason='current-party' />;
  }

  const error = errorFromMutation || errorFromQuery;
  if (error) {
    return <DisplayError error={error} />;
  }

  if (!validParties?.length) {
    return <NoValidPartiesError />;
  }

  const partyFromMutation = dataFromMutation === 'Party successfully updated' ? sentToMutation : undefined;
  const currentParty = partyFromMutation ?? partyFromQuery;
  const currentIsValid = currentParty && validParties?.some((party) => party.partyId === currentParty.partyId);

  return (
    <RealCurrentPartyProvider
      value={{
        party: currentParty,
        currentIsValid,
        userHasSelectedParty,
        setUserHasSelectedParty: (hasSelected: boolean) => setUserHasSelectedParty(hasSelected),
        setParty: async (party) => {
          try {
            setSentToMutation(party);
            const result = await mutateAsync(party);
            if (result === 'Party successfully updated') {
              return party;
            }
            return undefined;
          } catch (_err) {
            // Ignoring error here, as it's handled by this provider
          }
        },
      }}
    >
      {children}
    </RealCurrentPartyProvider>
  );
};

export function PartyProvider({ children }: PropsWithChildren) {
  const shouldFetchProfile = useShouldFetchProfile();

  if (!shouldFetchProfile) {
    return children;
  }

  return (
    <PartiesProvider>
      <CurrentPartyProvider>{children}</CurrentPartyProvider>
    </PartiesProvider>
  );
}

export const usePartiesAllowedToInstantiate = () => usePartiesAllowedToInstantiateCtx();

/**
 * Returns the current party, or the custom selected current party if one is set.
 * Please note that the current party might not be allowed to instantiate, so you should
 * check the `canInstantiate` property as well.
 */
export const useCurrentParty = () => useCurrentPartyCtx().party;
export const useCurrentPartyIsValid = () => useCurrentPartyCtx().currentIsValid;
export const useSetCurrentParty = () => useCurrentPartyCtx().setParty;

export const useValidParties = () =>
  flattenParties(usePartiesAllowedToInstantiateCtx() ?? [])?.filter((party) => party.isDeleted === false);

export const useHasSelectedParty = () => useCurrentPartyCtx().userHasSelectedParty;

export const useSetHasSelectedParty = () => useCurrentPartyCtx().setUserHasSelectedParty;

export function useInstanceOwnerParty(): IParty | null {
  const parties = usePartiesAllowedToInstantiate() ?? [];
  const instanceOwner = useLaxInstanceData((i) => i.instanceOwner);

  if (!instanceOwner) {
    return null;
  }

  // If the backend is updated to v8.6.0 it will return the whole party object on the instance owner,
  // so we can use that directly.
  if (instanceOwner?.party) {
    return instanceOwner.party;
  }

  // Backwards compatibility: if the backend returns only the partyId, we need to find the party in the list of parties.
  // This logic assumes that the current logged in user has "access" to the party of the instance owner,
  // as the parties array comes from the current users party list.
  return flattenParties(parties)?.find((party) => party.partyId.toString() === instanceOwner.partyId) ?? null;
}
