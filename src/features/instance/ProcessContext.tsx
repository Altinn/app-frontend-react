import React, { createContext, useContext, useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { skipToken, useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { Loader } from 'src/core/loading/Loader';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { TaskKeys, useNavigatePage } from 'src/hooks/useNavigatePage';
import { fetchProcessState } from 'src/queries/queries';
import { behavesLikeDataTask } from 'src/utils/formLayout';
import type { QueryDefinition } from 'src/core/queries/usePrefetchQuery';
import type { IProcess } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

// Also used for prefetching @see appPrefetcher.ts
export function getProcessQueryDef(instanceId?: string): QueryDefinition<IProcess> {
  return {
    queryKey: ['fetchProcessState', instanceId],
    queryFn: instanceId ? () => fetchProcessState(instanceId) : skipToken,
    enabled: !!instanceId,
  };
}

const ProcessContext = createContext<Pick<UseQueryResult<IProcess, HttpClientError>, 'data' | 'refetch'> | undefined>(
  undefined,
);

export function ProcessProvider({ children, instanceId }: PropsWithChildren<{ instanceId: string }>) {
  const taskIdParam = useNavigationParam('taskId');
  const layoutSets = useLayoutSets();
  const navigateToTask = useNavigatePage().navigateToTask;

  const {
    isLoading,
    data: process,
    error,
    refetch,
  } = useQuery<IProcess, HttpClientError>(getProcessQueryDef(instanceId));

  useEffect(() => {
    error && window.logError('Fetching process state failed:\n', error);
  }, [error]);

  if (process?.ended) {
    const hasCustomReceipt = behavesLikeDataTask(TaskKeys.CustomReceipt, layoutSets);
    hasCustomReceipt ? navigateToTask(TaskKeys.CustomReceipt) : navigateToTask(TaskKeys.ProcessEnd);
  }

  const currentProcessTaskId = process?.currentTask?.elementId;
  if (currentProcessTaskId && currentProcessTaskId !== taskIdParam) {
    navigateToTask(currentProcessTaskId, { replace: true, runEffect: taskIdParam !== undefined });
  }

  if (isLoading) {
    return <Loader reason='fetching-process' />;
  }

  if (error) {
    return <DisplayError error={error} />;
  }

  return <ProcessContext.Provider value={{ data: process, refetch }}>{children}</ProcessContext.Provider>;
}

export const useHasProcessProvider = () => useContext(ProcessContext) !== undefined;
export const useLaxProcessData = () => useContext(ProcessContext)?.data;
export const useReFetchProcessData = () => useContext(ProcessContext)?.refetch;
