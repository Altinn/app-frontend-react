import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { skipToken, useQuery } from '@tanstack/react-query';
import deepEqual from 'fast-deep-equal';
import { createStore } from 'zustand';
import type { QueryObserverResult } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { ContextNotProvided } from 'src/core/contexts/context';
import { DataLoadingProvider } from 'src/core/contexts/dataLoadingContext';
import { createZustandContext } from 'src/core/contexts/zustandContext';
import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { Loader } from 'src/core/loading/Loader';
import { cleanUpInstanceData } from 'src/features/instance/instanceUtils';
import { ProcessProvider } from 'src/features/instance/ProcessContext';
import { useInstantiation } from 'src/features/instantiate/InstantiationContext';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { buildInstanceDataSources } from 'src/utils/instanceDataSources';
import type { QueryDefinition } from 'src/core/queries/usePrefetchQuery';
import type { IData, IInstance, IInstanceDataSources } from 'src/types/shared';

export interface InstanceContext {
  // Instance identifiers
  partyId: string;
  instanceGuid: string;
  instanceId: string;

  // Data
  data: IInstance | undefined;
  dataSources: IInstanceDataSources | null;

  // Methods/utilities
  appendDataElement: (element: IData) => void;
  mutateDataElement: (elementId: string, mutator: (element: IData) => IData) => void;
  removeDataElement: (elementId: string) => void;

  changeData: ChangeInstanceData;
  reFetch: () => Promise<QueryObserverResult<IInstance>>;
  setReFetch: (reFetch: () => Promise<QueryObserverResult<IInstance>>) => void;
}

export type ChangeInstanceData = (callback: (instance: IInstance | undefined) => IInstance | undefined) => void;

type InstanceStoreProps = Pick<InstanceContext, 'partyId' | 'instanceGuid'>;

const { Provider, useMemoSelector, useSelector, useLaxSelector, useHasProvider } = createZustandContext({
  name: 'InstanceContext',
  required: true,
  initialCreateStore: (props: InstanceStoreProps) =>
    createStore<InstanceContext>((set) => ({
      ...props,
      instanceId: `${props.partyId}/${props.instanceGuid}`,
      data: undefined,
      dataSources: null,
      appendDataElement: (element) =>
        set((state) => {
          if (!state.data) {
            throw new Error('Cannot append data element when instance data is not set');
          }
          const next = { ...state.data, data: [...state.data.data, element] };
          return { ...state, data: next, dataSources: buildInstanceDataSources(next) };
        }),
      mutateDataElement: (elementId, mutator) =>
        set((state) => {
          if (!state.data) {
            throw new Error('Cannot mutate data element when instance data is not set');
          }
          const next = {
            ...state.data,
            data: state.data.data.map((element) => (element.id === elementId ? mutator(element) : element)),
          };
          return { ...state, data: next, dataSources: buildInstanceDataSources(next) };
        }),
      removeDataElement: (elementId) =>
        set((state) => {
          if (!state.data) {
            throw new Error('Cannot remove data element when instance data is not set');
          }
          const next = { ...state.data, data: state.data.data.filter((element) => element.id !== elementId) };
          return { ...state, data: next, dataSources: buildInstanceDataSources(next) };
        }),
      changeData: (callback) =>
        set((state) => {
          const next = callback(state.data);
          const clean = cleanUpInstanceData(next);
          if (clean && !deepEqual(state.data, clean)) {
            return { ...state, data: next, dataSources: buildInstanceDataSources(next) };
          }
          return {};
        }),
      reFetch: async () => {
        throw new Error('reFetch not implemented yet');
      },
      setReFetch: (reFetch) =>
        set({
          reFetch: async () => {
            const result = await reFetch();
            set((state) => ({ ...state, data: result.data, dataSources: buildInstanceDataSources(result.data) }));
            return result;
          },
        }),
    })),
});

// Also used for prefetching @see appPrefetcher.ts
export function useInstanceDataQueryDef(
  hasResultFromInstantiation: boolean,
  partyId?: string,
  instanceGuid?: string,
): QueryDefinition<IInstance> {
  const { fetchInstanceData } = useAppQueries();
  return {
    queryKey: ['fetchInstanceData', partyId, instanceGuid],
    queryFn: partyId && instanceGuid ? () => fetchInstanceData(partyId, instanceGuid) : skipToken,
    enabled: !!partyId && !!instanceGuid && !hasResultFromInstantiation,
  };
}

function useGetInstanceDataQuery(hasResultFromInstantiation: boolean, partyId: string, instanceGuid: string) {
  const utils = useQuery(useInstanceDataQueryDef(hasResultFromInstantiation, partyId, instanceGuid));

  useEffect(() => {
    utils.error && window.logError('Fetching instance data failed:\n', utils.error);
  }, [utils.error]);

  return utils;
}

export const InstanceProvider = ({ children }: { children: React.ReactNode }) => {
  const partyId = useNavigationParam('partyId');
  const instanceGuid = useNavigationParam('instanceGuid');

  if (!partyId || !instanceGuid) {
    return null;
  }

  return (
    <DataLoadingProvider>
      <InnerInstanceProvider
        partyId={partyId}
        instanceGuid={instanceGuid}
      >
        {children}
      </InnerInstanceProvider>
    </DataLoadingProvider>
  );
};

const InnerInstanceProvider = ({
  children,
  partyId,
  instanceGuid,
}: {
  children: React.ReactNode;
  partyId: string;
  instanceGuid: string;
}) => (
  <Provider
    partyId={partyId}
    instanceGuid={instanceGuid}
  >
    <BlockUntilLoaded>
      <ProcessProvider instanceId={`${partyId}/${instanceGuid}`}>{children}</ProcessProvider>
    </BlockUntilLoaded>
  </Provider>
);

const BlockUntilLoaded = ({ children }: PropsWithChildren) => {
  const partyId = useSelector((state) => state.partyId);
  const instanceGuid = useSelector((state) => state.instanceGuid);
  const changeData = useSelector((state) => state.changeData);
  const setReFetch = useSelector((state) => state.setReFetch);
  const instantiation = useInstantiation();
  const {
    error: queryError,
    isLoading,
    data: queryData,
    refetch,
  } = useGetInstanceDataQuery(!!instantiation.lastResult, partyId, instanceGuid);
  const isDataSet = useSelector((state) => state.data !== undefined);

  const error = instantiation.error ?? queryError;
  const data = instantiation.lastResult ?? queryData;

  useEffect(() => {
    data && changeData(() => data);
  }, [changeData, data]);

  useEffect(() => {
    setReFetch(refetch);
  }, [refetch, setReFetch]);

  if (error) {
    return <DisplayError error={error} />;
  }

  if (isLoading || !isDataSet) {
    return <Loader reason='instance' />;
  }

  return <>{children}</>;
};

/**
 * There are strict and lax (relaxed) versions of both of these. The lax versions will return undefined if the context
 * is not available, while the strict versions will throw an error. Always prefer the strict versions in code you
 * know should only be used in instanceful contexts. Code paths that have to work in stateless/instanceless contexts
 * should use the lax versions and handle the undefined case.
 */
function useLaxInstance<U>(selector: (state: InstanceContext) => U) {
  const out = useLaxSelector(selector);
  return out === ContextNotProvided ? undefined : out;
}

export const useLaxInstanceId = () => useLaxInstance((state) => state.instanceId);
export const useLaxInstanceData = () => useLaxInstance((state) => state.data);
export const useLaxAppendDataElement = () => useLaxInstance((state) => state.appendDataElement);
export const useLaxMutateDataElement = () => useLaxInstance((state) => state.mutateDataElement);
export const useLaxRemoveDataElement = () => useLaxInstance((state) => state.removeDataElement);
export const useLaxInstanceDataSources = () => useLaxInstance((state) => state.dataSources) ?? null;
export const useLaxChangeInstance = (): ChangeInstanceData | undefined => useLaxInstance((state) => state.changeData);
export const useHasInstance = () => useHasProvider();

const emptyArray: never[] = [];
export const useStrictInstance = () => useSelector((state) => state);
export const useStrictInstanceId = () => useSelector((state) => state.instanceId);
export const useStrictDataElements = (dataType: string | undefined) =>
  useMemoSelector((state) => state.data?.data.filter((d) => d.dataType === dataType)) ?? emptyArray;
