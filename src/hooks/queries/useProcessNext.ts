import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { useAppMutations } from 'src/contexts/appQueriesContext';
import { useInstance } from 'src/hooks/queries/useInstance';
import { useLanguage } from 'src/hooks/useLanguage';
import type { IActionType, IProcess } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface ProcessNextProps {
  taskId?: string;
  action?: IActionType;
}

export function useProcessNext(node: LayoutNode) {
  const { doProcessNext } = useAppMutations();
  const { changeData: changeInstance } = useInstance();
  const language = useLanguage().selectedLanguage;
  const [busyWithId, setBusyWithId] = useState<string | undefined>(undefined);

  const utils = useMutation({
    mutationFn: ({ taskId, action }: ProcessNextProps = {}) => {
      setBusyWithId(node.item.id);
      return doProcessNext.call(taskId, language, action);
    },
    onSuccess: (data: IProcess) => {
      setBusyWithId(undefined);
      doProcessNext.setLastResult(data);
      changeInstance((instance) => (instance ? { ...instance, process: data } : instance));
    },
    onError: (error: Error) => {
      setBusyWithId(undefined);
      window.logError('Process next failed:\n', error);
    },
  });

  return {
    busyWithId,
    ...utils,
  };
}
