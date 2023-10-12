import { useCallback, useEffect, useRef } from 'react';

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

type LoadingState = false | 'from-submit-ready' | 'form-submitting' | 'direct';

export function useProcessNext(nodeId: string) {
  const dispatch = useAppDispatch();
  const loadingRef = useRef<LoadingState>(false);
  const submittingState = useAppSelector((state) => state.formData.submitting.state);
  const realTaskType = useRealTaskType();
  const { doProcessNext } = useAppMutations();
  const { changeData: changeInstance, processNavigation, instanceId } = useStrictInstance();
  const { setBusyWithId, busyWithId, busy, setError } = processNavigation;
  const language = useLanguage().selectedLanguage;

  const setLoading = useCallback(
    (state: LoadingState) => {
      loadingRef.current = state;
      setBusyWithId(nodeId);
      setError(undefined);
    },
    [nodeId, setBusyWithId, setError],
  );

  const setLoadingFinished = useCallback(
    (error?: HttpClientError) => {
      loadingRef.current = false;
      setBusyWithId(undefined);
      setError(error);
    },
    [setBusyWithId, setError],
  );

  const utils = useMutation({
    mutationFn: ({ taskId, action }: ProcessNextProps = {}) => doProcessNext.call(taskId, language, action),
    onSuccess: (data: IProcess) => {
      setLoadingFinished();
      doProcessNext.setLastResult(data);
      changeInstance((instance) => (instance ? { ...instance, process: data } : instance));
    },
    onError: (error: HttpClientError) => {
      setLoadingFinished(error);
      window.logError('Process next failed:\n', error);
    },
  });

  const nativeMutate = utils.mutate;

  useEffect(() => {
    if (submittingState === 'ready' && loadingRef.current) {
      setLoading('from-submit-ready');
      nativeMutate({});
      dispatch(FormDataActions.submitClear());
    }
  }, [dispatch, nativeMutate, setLoading, submittingState]);

  const mutate = useCallback(
    (props?: ProcessNextProps) => {
      if (realTaskType === ProcessTaskType.Data && submittingState === 'inactive' && !loadingRef.current) {
        setLoading('form-submitting');
        const { org, app } = window;
        dispatch(
          FormDataActions.submit({
            url: `${window.location.origin}/${org}/${app}/api/${instanceId}`,
            componentId: nodeId,
          }),
        );
        return;
      }

      if (!loadingRef.current) {
        setLoading('direct');
        nativeMutate(props || {});
      }
    },
    [realTaskType, submittingState, setLoading, dispatch, instanceId, nodeId, nativeMutate],
  );

  return {
    busy,
    busyWithId,
    ...utils,
    mutate,
  };
}
