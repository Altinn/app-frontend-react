import { useCallback, useEffect } from 'react';

import { useMutation } from '@tanstack/react-query';

import { useAppMutations } from 'src/contexts/appQueriesContext';
import { FormDataActions } from 'src/features/formData/formDataSlice';
import { useStrictInstance } from 'src/features/instance/InstanceContext';
import { useRealTaskType } from 'src/features/instance/useProcess';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { ProcessTaskType } from 'src/types';
import type { IActionType, IProcess } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

interface ProcessNextProps {
  taskId?: string;
  action?: IActionType;
}

export function useProcessNext(nodeId: string) {
  const dispatch = useAppDispatch();
  const submittingState = useAppSelector((state) => state.formData.submitting.state);
  const realTaskType = useRealTaskType();
  const { doProcessNext } = useAppMutations();
  const { changeData: changeInstance, processNavigation, instanceId } = useStrictInstance();
  const { setBusyWithId, busyWithId, busy, setError } = processNavigation;
  const language = useLanguage().selectedLanguage;

  const utils = useMutation({
    mutationFn: ({ taskId, action }: ProcessNextProps = {}) => {
      setBusyWithId(nodeId);
      setError(undefined);
      return doProcessNext.call(taskId, language, action);
    },
    onSuccess: (data: IProcess) => {
      setBusyWithId(undefined);
      setError(undefined);
      doProcessNext.setLastResult(data);
      changeInstance((instance) => (instance ? { ...instance, process: data } : instance));
    },
    onError: (error: HttpClientError) => {
      setBusyWithId(undefined);
      setError(error);
      window.logError('Process next failed:\n', error);
    },
  });

  const nativeMutate = utils.mutate;

  useEffect(() => {
    if (submittingState === 'ready') {
      nativeMutate({});
      dispatch(FormDataActions.submitClear());
    }
  }, [dispatch, nativeMutate, submittingState]);

  const mutate = useCallback(
    (props?: ProcessNextProps) => {
      if (realTaskType === ProcessTaskType.Data && submittingState === 'inactive') {
        const { org, app } = window;
        dispatch(
          FormDataActions.submit({
            url: `${window.location.origin}/${org}/${app}/api/${instanceId}`,
            componentId: nodeId,
          }),
        );
        return;
      }

      nativeMutate(props || {});
    },
    [dispatch, instanceId, nodeId, realTaskType, submittingState, nativeMutate],
  );

  return {
    busy,
    busyWithId,
    ...utils,
    mutate,
  };
}
