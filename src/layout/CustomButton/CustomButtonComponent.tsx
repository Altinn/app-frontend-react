import React from 'react';

import { Button } from '@digdir/design-system-react';
import { useMutation } from '@tanstack/react-query';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { FormDataActions } from 'src/features/formData/formDataSlice';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useNavigationParams } from 'src/hooks/useNavigatePage';
import { flattenObject } from 'src/utils/databindings';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IUserAction } from 'src/types/shared';

type Props = PropsFromGenericComponent<'CustomButton'>;

type UpdatedDataModels = Record<string, unknown>;

type FrontendActionFunctions = 'navigateNext' | 'navigatePrevious' | 'navigateToPage';

type FrontendAction = {
  name: FrontendActionFunctions;
  metadata: Record<string, unknown>;
};

export type ActionResult = {
  updatedDataModels?: UpdatedDataModels;
  frontendActions?: FrontendAction[];
};

type UseHandleFrontendActions = {
  handleFrontendActions: (actions: FrontendAction[]) => Promise<void>;
  handleDataModelUpdate: (updatedDataModels: UpdatedDataModels) => Promise<void>;
};

function useHandleFrontendActions(): UseHandleFrontendActions {
  const dispatch = useAppDispatch();
  const currentDataModelGuid = useCurrentDataModelGuid();

  const _handleAction = async (action: FrontendAction) => {
    console.log('Handle Actoin: ', action);
  };

  return {
    handleFrontendActions: async (actions) => {
      for (const action of actions) {
        await _handleAction(action);
      }
    },
    handleDataModelUpdate: async (updatedDataModels) => {
      const currentDataModelUpdates = currentDataModelGuid && updatedDataModels[currentDataModelGuid];
      if (currentDataModelUpdates) {
        dispatch(FormDataActions.fetchFulfilled({ formData: flattenObject(currentDataModelUpdates) }));
      }
    },
  };
}

type ActionMutationProps = {
  action: string;
  buttonId: string;
};

function useActionMutation() {
  const { doPerformAction } = useAppMutations();
  const { partyId, instanceGuid } = useNavigationParams();
  const { handleFrontendActions, handleDataModelUpdate } = useHandleFrontendActions();

  return useMutation({
    mutationFn: async ({ action, buttonId }: ActionMutationProps) => {
      if (!instanceGuid || !partyId) {
        throw Error('Cannot perform action without partyId and instanceGuid');
      }
      return doPerformAction.call(partyId, instanceGuid, { action, buttonId });
    },
    onSuccess: async (data) => {
      console.log('Success: ', data);
      if (data.updatedDataModels) {
        await handleDataModelUpdate(data.updatedDataModels);
      }
      if (data.frontendActions) {
        await handleFrontendActions(data.frontendActions);
      }
    },
    onError: async (error) => {
      console.log('ERROR: ', error);
    },
  });
}

export function useActionAuthorization() {
  const userActions = useLaxProcessData()?.currentTask?.userActions;
  return {
    isAuthorized: (action: IUserAction['id']) => userActions?.find((a) => a.id === action)?.authorized ?? false,
  };
}

export const CustomButtonComponent = ({ node }: Props) => {
  const { textResourceBindings, action, id } = node.item;
  const { isAuthorized } = useActionAuthorization();

  const mutation = useActionMutation();
  const disabled = !isAuthorized(action) || mutation.isLoading;

  const onClick = async () => {
    if (disabled) {
      return;
    }
    mutation.mutate({ action, buttonId: id });
  };

  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      aria-busy={mutation.isLoading}
    >
      <Lang id={textResourceBindings?.label} />
    </Button>
  );
};
