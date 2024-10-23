import React, { createContext, useContext, useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { skipToken, useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { Loader } from 'src/core/loading/Loader';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { layoutSetIsDefault } from 'src/features/form/layoutSets/TypeGuards';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { TaskKeys, useNavigatePage } from 'src/hooks/useNavigatePage';
import { fetchProcessState } from 'src/queries/queries';
import { ProcessTaskType } from 'src/types';
import type { QueryDefinition } from 'src/core/queries/usePrefetchQuery';
import type { ILayoutSets } from 'src/layout/common.generated';
import type { IProcess, ITask } from 'src/types/shared';
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
  const taskId = useNavigationParam('taskId');
  const layoutSets = useLayoutSets();
  const navigateToTask = useNavigatePage().navigateToTask;

  const { isLoading, data, error, refetch } = useQuery<IProcess, HttpClientError>(getProcessQueryDef(instanceId));

  useEffect(() => {
    const elementId = data?.currentTask?.elementId;
    if (data?.ended) {
      const hasCustomReceipt = behavesLikeDataTask(TaskKeys.CustomReceipt, layoutSets);
      if (hasCustomReceipt) {
        navigateToTask(TaskKeys.CustomReceipt);
      } else {
        navigateToTask(TaskKeys.ProcessEnd);
      }
    } else if (elementId && elementId !== taskId) {
      navigateToTask(elementId, { replace: true, runEffect: taskId !== undefined });
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    error && window.logError('Fetching process state failed:\n', error);
  }, [error]);

  if (isLoading) {
    return <Loader reason='fetching-process' />;
  }

  if (error) {
    return <DisplayError error={error} />;
  }

  return <ProcessContext.Provider value={{ data, refetch }}>{children}</ProcessContext.Provider>;
}

export const useHasProcessProvider = () => useContext(ProcessContext) !== undefined;
export const useLaxProcessData = () => useContext(ProcessContext)?.data;
export const useReFetchProcessData = () => useContext(ProcessContext)?.refetch;

export function useCurrentTaskType() {
  const processData = useLaxProcessData();
  const isStateless = useApplicationMetadata().isStatelessApp;
  const layoutSets = useLayoutSets();
  const currentTask = processData?.currentTask;
  const taskType = toTaskType({ task: currentTask, ended: processData?.ended, isStateless, layoutSets });
  return taskType;
}

function toTaskType({
  task,
  ended,
  isStateless,
  layoutSets,
}: {
  task: ITask | undefined;
  ended: string | null | undefined;
  isStateless: boolean;
  layoutSets: ReturnType<typeof useLayoutSets>;
}): ProcessTaskType {
  const taskId = task?.elementId;

  if (ended || taskId === TaskKeys.ProcessEnd) {
    return ProcessTaskType.Archived;
  }

  // Stateless apps only have data tasks. As soon as they start creating an instance from that stateless step,
  // applicationMetadata.isStatelessApp will return false and we'll proceed as normal.
  if (isStateless || taskId === TaskKeys.CustomReceipt || behavesLikeDataTask(taskId, layoutSets)) {
    return ProcessTaskType.Data;
  }

  return altinnTaskTypeToProcessTaskType(task?.altinnTaskType);
}

function altinnTaskTypeToProcessTaskType(altinnTaskType: string | undefined): ProcessTaskType {
  switch (altinnTaskType) {
    case 'data':
      return ProcessTaskType.Data;
    case 'confirmation':
      return ProcessTaskType.Confirm;
    case 'feedback':
      return ProcessTaskType.Feedback;
    case 'payment':
      return ProcessTaskType.Payment;
    default:
      return ProcessTaskType.Unknown;
  }
}

/**
 * This hook returns the taskType of a given taskId. If the
 * taskId cannot be found in processTasks it will return the
 * taskType of the currentTask if the currentTask matches
 * the taskId provided.
 */
export function useGetTaskTypeByTaskId() {
  const processData = useLaxProcessData();
  const isStateless = useApplicationMetadata().isStatelessApp;
  const layoutSets = useLayoutSets();

  return (taskId: string | undefined) => {
    const foundTask = processData?.processTasks?.find((t) => t.elementId === taskId);
    const defaultTask = processData?.currentTask?.elementId === taskId ? processData?.currentTask : undefined;

    return toTaskType({ task: foundTask ?? defaultTask, ended: processData?.ended, isStateless, layoutSets });
  };
}

/**
 * Some tasks other than data (for instance confirm, or other in the future) can be configured to behave like data steps
 * @param task the task
 * @param layoutSets the layout sets
 */
export function behavesLikeDataTask(task: string | null | undefined, layoutSets: ILayoutSets | null): boolean {
  if (!task) {
    return false;
  }

  return (
    layoutSets?.sets.some((set) => {
      if (layoutSetIsDefault(set) && set.tasks?.length) {
        return set.tasks.includes(task);
      }
      return false;
    }) || false
  );
}
