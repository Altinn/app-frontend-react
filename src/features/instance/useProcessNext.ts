import { useMutation } from '@tanstack/react-query';

import { useAppMutations } from 'src/contexts/appQueriesContext';
import { useStrictInstance } from 'src/features/instance/InstanceContext';
import { useLanguage } from 'src/hooks/useLanguage';
import type { IActionType, IProcess } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

interface ProcessNextProps {
  taskId?: string;
  action?: IActionType;
}

export function useProcessNext(nodeId: string) {
  const { doProcessNext } = useAppMutations();
  const { changeData: changeInstance, processNavigation } = useStrictInstance();
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

  return {
    busy,
    busyWithId,
    ...utils,
  };
}
