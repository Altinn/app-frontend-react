import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';

import { useAppMutations, useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { createContext } from 'src/core/contexts/context';
import { delayedContext } from 'src/core/contexts/delayedContext';
import { createQueryContext } from 'src/core/contexts/queryContext';
import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { useAllowAnonymousIs } from 'src/features/applicationMetadata/getAllowAnonymous';
import { usePartyCanInstantiate } from 'src/features/party/ValidPartyProvider';
import type { IParty } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

const useShouldFetchProfile = () => useAllowAnonymousIs(false);

const usePartiesQuery = () => {
  const enabled = useShouldFetchProfile();

  const { fetchParties } = useAppQueries();
  const utils = useQuery({
    enabled,
    queryKey: ['fetchUseParties'],
    queryFn: () => fetchParties(),
    onError: (error: HttpClientError) => {
      window.logError('Fetching parties failed:\n', error);
    },
  });

  return {
    ...utils,
    enabled,
  };
};

const useCurrentPartyQuery = () => {
  const enabled = useShouldFetchProfile();

  const { fetchCurrentParty } = useAppQueries();
  const utils = useQuery({
    enabled,
    queryKey: ['fetchUseCurrentParty'],
    queryFn: () => fetchCurrentParty(),
    onError: (error: HttpClientError) => {
      window.logError('Fetching current party failed:\n', error);
    },
  });

  return { ...utils, enabled };
};

const useSelectPartyMutation = () => {
  const { doSelectParty } = useAppMutations();
  return useMutation({
    mutationFn: (party: IParty) => doSelectParty.call(party.partyId),
    onError: (error: HttpClientError) => {
      window.logError('Selecting party failed:\n', error);
    },
  });
};

const { Provider: PartiesProvider, useCtx: usePartiesCtx } = delayedContext(() =>
  createQueryContext<IParty[] | undefined, false>({
    name: 'Parties',
    required: false,
    default: undefined,
    query: usePartiesQuery,
  }),
);

const { Provider: CurrentPartyProvider, useCtx: useCurrentPartyCtx } = delayedContext(() =>
  createQueryContext<IParty | undefined, false>({
    name: 'CurrentParty',
    required: false,
    default: undefined,
    query: useCurrentPartyQuery,
  }),
);

interface CustomParty {
  party: IParty | undefined;
  selectParty: (party: IParty) => Promise<IParty | undefined>;
}

const { Provider: RealCustomCurrentPartyProvider, useCtx: useCustomCurrentPartyCtx } = createContext<
  CustomParty | undefined
>({
  name: 'CustomCurrentParty',
  required: false,
  default: undefined,
});

const CustomCurrentPartyProvider = ({ children }: PropsWithChildren) => {
  const [selectedParty, setSelectedParty] = useState<IParty | undefined>(undefined);
  const { mutateAsync, error, data: fromMutation } = useSelectPartyMutation();

  // When the mutation is done setting the current party cookie, we can continue
  // setting the current party in the context.
  useEffect(() => {
    if (fromMutation) {
      setSelectedParty(fromMutation);
    }
  }, [fromMutation]);

  if (error) {
    return <DisplayError error={error} />;
  }

  return (
    <RealCustomCurrentPartyProvider
      value={{
        party: selectedParty,
        selectParty: async (party) => {
          try {
            return (await mutateAsync(party)) || undefined;
          } catch (error) {
            // Intentionally swallow error, as it is handled by the mutation
          }
        },
      }}
    >
      {children}
    </RealCustomCurrentPartyProvider>
  );
};

export function PartyProvider({ children }: PropsWithChildren) {
  return (
    <PartiesProvider>
      <CurrentPartyProvider>
        <CustomCurrentPartyProvider>{children}</CustomCurrentPartyProvider>
      </CurrentPartyProvider>
    </PartiesProvider>
  );
}

export const useParties = () => usePartiesCtx();

interface CurrentPartyContext {
  party: IParty | undefined;
  canInstantiate: boolean;
  source: 'default' | 'manuallySelected';
}

/**
 * Returns the current party, or the custom selected current party if one is set.
 * Please note that the current party might not be allowed to instantiate, so you should
 * check the `canInstantiate` property as well.
 */
export const useCurrentParty = (): CurrentPartyContext => {
  const currentParty = useCurrentPartyCtx();
  const customParty = useCustomCurrentPartyCtx()?.party;
  const canInstantiate = usePartyCanInstantiate();

  return {
    party: customParty ?? currentParty,
    canInstantiate,
    source: customParty ? 'manuallySelected' : 'default',
  };
};

export const useSelectCurrentParty = () => useCustomCurrentPartyCtx()?.selectParty;
