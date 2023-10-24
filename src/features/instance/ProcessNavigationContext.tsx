import React, { useCallback, useEffect, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { useAppMutations } from 'src/contexts/appQueriesContext';
import { useAttachments } from 'src/features/attachments/AttachmentsContext';
import { DisplayError } from 'src/features/errorHandling/DisplayError';
import { FormDataActions } from 'src/features/formData/formDataSlice';
import { useStrictInstance } from 'src/features/instance/InstanceContext';
import { useRealTaskType, useSetProcessData } from 'src/features/instance/ProcessContext';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { ProcessTaskType } from 'src/types';
import { createLaxContext } from 'src/utils/createContext';
import type { IActionType, IProcess } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';

interface ProcessNextProps {
  taskId?: string;
  action?: IActionType;
}

function useProcessNext() {
  const dispatch = useAppDispatch();
  const submittingState = useAppSelector((state) => state.formData.submittingState);
  const realTaskType = useRealTaskType();
  const { doProcessNext } = useAppMutations();
  const { reFetch: reFetchInstanceData } = useStrictInstance();
  const language = useLanguage().selectedLanguage;
  const setProcessData = useSetProcessData();

  const utils = useMutation({
    mutationFn: ({ taskId, action }: ProcessNextProps = {}) => doProcessNext.call(taskId, language, action),
    onSuccess: async (data: IProcess) => {
      doProcessNext.setLastResult(data);
      setProcessData && setProcessData(data);
      await reFetchInstanceData();
    },
    onError: (error: HttpClientError) => {
      window.logError('Process next failed:\n', error);
    },
  });

  const nativeMutate = utils.mutate;

  useEffect(() => {
    if (submittingState === 'validationSuccessful') {
      nativeMutate({});
      dispatch(FormDataActions.submitClear());
    }
  }, [dispatch, nativeMutate, submittingState]);

  const perform = useCallback(
    (props: ProcessNextProps) => {
      if (submittingState !== 'inactive') {
        return;
      }

      if (
        realTaskType === ProcessTaskType.Data &&
        // Skipping the full form data submit if an action is set. Signing, rejecting, etc should not attempt to submit
        // form data, as you probably only have read-access to the data model at this point.
        !props?.action
      ) {
        dispatch(FormDataActions.submit());
        return;
      }

      nativeMutate(props || {});
    },
    [realTaskType, submittingState, dispatch, nativeMutate],
  );

  return { perform, error: utils.error };
}

interface ContextData {
  busy: boolean;
  busyWithId: string;
  canSubmit: boolean;
  attachmentsPending: boolean;
  next: (props: ProcessNextProps & { nodeId: string }) => Promise<void>;
}

const { Provider, useCtx } = createLaxContext<ContextData>();

export function ProcessNavigationProvider({ children }: React.PropsWithChildren) {
  const { perform, error } = useProcessNext();
  const [busyWithId, setBusyWithId] = useState<string>('');
  const submittingState = useAppSelector((state) => state.formData.submittingState);

  const attachments = useAttachments();
  const attachmentsPending = Object.values(attachments).some(
    (fileUploader) =>
      fileUploader?.some((attachment) => !attachment.uploaded || attachment.updating || attachment.deleting),
  );

  useEffect(() => {
    if (submittingState === 'validationSuccessful' || submittingState === 'inactive') {
      setBusyWithId('');
    }
  }, [submittingState]);

  if (error) {
    return <DisplayError error={error} />;
  }

  return (
    <Provider
      value={{
        busy: !!busyWithId,
        busyWithId,
        canSubmit: !attachmentsPending && !busyWithId,
        attachmentsPending,
        next: async ({ nodeId, ...rest }) => {
          if (busyWithId) {
            return;
          }

          setBusyWithId(nodeId);
          perform(rest);
        },
      }}
    >
      {children}
    </Provider>
  );
}

export const useProcessNavigation = () => useCtx();
