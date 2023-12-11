import React from 'react';
import { toast } from 'react-toastify';

import { Button } from '@digdir/design-system-react';
import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { FormDataActions } from 'src/features/formData/formDataSlice';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useNavigatePage, useNavigationParams } from 'src/hooks/useNavigatePage';
import { isSpecificClientAction } from 'src/layout/CustomButton/typeHelpers';
import { flattenObject } from 'src/utils/databindings';
import { promisify } from 'src/utils/promisify';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ButtonColor, ButtonVariant } from 'src/layout/Button/WrappedButton';
import type * as CBTypes from 'src/layout/CustomButton/config.generated';
import type { ClientActionHandlers } from 'src/layout/CustomButton/typeHelpers';
import type { IUserAction } from 'src/types/shared';

type Props = PropsFromGenericComponent<'CustomButton'>;

type UpdatedDataModels = Record<string, unknown>;

export type ActionResult = {
  updatedDataModels?: UpdatedDataModels;
  clientActions?: CBTypes.ClientAction[];
};

type UseHandleClientActions = {
  handleClientActions: (actions: CBTypes.ClientAction[]) => Promise<void>;
  handleDataModelUpdate: (updatedDataModels: UpdatedDataModels) => Promise<void>;
};

/**
 * A type guard to check if the action is an action that can be run entirely on the client
 */
const isClientAction = (action: CBTypes.CustomAction): action is CBTypes.ClientAction => action.type === 'ClientAction';
/**
 * A type guard to check if the action is an action that requires a server side call
 */
const isServerAction = (action: CBTypes.CustomAction): action is CBTypes.ServerAction => action.type === 'ServerAction';

function useHandleClientActions(): UseHandleClientActions {
  const dispatch = useAppDispatch();
  const currentDataModelGuid = useCurrentDataModelGuid();
  const { navigateToPage, navigateToNextPage, navigateToPreviousPage } = useNavigatePage();

  const frontendActions: ClientActionHandlers = {
    nextPage: promisify(navigateToNextPage),
    previousPage: promisify(navigateToPreviousPage),
    navigateToPage: promisify<ClientActionHandlers['navigateToPage']>(async ({ page }) => navigateToPage(page)),
  };

  const handleClientAction = async (action: CBTypes.ClientAction) => {
    if (isSpecificClientAction('navigateToPage', action)) {
      return await frontendActions[action.name](action.metadata);
    }
    await frontendActions[action.name]();
  };

  return {
    handleClientActions: async (actions) => {
      for (const action of actions) {
        await handleClientAction(action);
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

type PerformActionMutationProps = {
  action: CBTypes.CustomAction;
  buttonId: string;
};

type UsePerformActionMutation = {
  mutation: UseMutationResult<ActionResult>;
  performAction: (props: PerformActionMutationProps) => Promise<void>;
};

type PerformActionMutationError = {
  response: {
    data: {
      error: {
        message: string;
        code: string;
        metadata: Record<string, unknown>;
      };
    };
  };
};

function usePerformActionMutation(): UsePerformActionMutation {
  const { doPerformAction } = useAppMutations();
  const { partyId, instanceGuid } = useNavigationParams();

  const mutation = useMutation({
    mutationFn: async ({ action, buttonId }: PerformActionMutationProps) => {
      if (!instanceGuid || !partyId) {
        throw Error('Cannot perform action without partyId and instanceGuid');
      }
      return doPerformAction.call(partyId, instanceGuid, { action: action.name, buttonId });
    },
  });
  const { handleClientActions, handleDataModelUpdate } = useHandleClientActions();

  return {
    mutation,
    /**
     * We wrap the mutation in a promise to make it possible to await both the mutation,
     * and the side effects that are run in the onSuccess or onError callbacks.
     */
    performAction: ({ action, buttonId }: PerformActionMutationProps) =>
      new Promise((resolve) =>
        mutation.mutate(
          { action, buttonId },
          {
            onSuccess: async (data) => {
              if (data.updatedDataModels) {
                await handleDataModelUpdate(data.updatedDataModels);
              }
              if (data.clientActions) {
                await handleClientActions(data.clientActions);
              }

              resolve();
            },
            onError: async (error: PerformActionMutationError) => {
              if (error?.response?.data?.error?.message !== undefined) {
                toast(error?.response?.data?.error?.message, { type: 'error' });
              } else {
                toast(<Lang id='custom_actions.general_error' />, { type: 'error' });
              }
            },
          },
        ),
      ),
  };
}

export function useActionAuthorization() {
  const currentTask = useLaxProcessData()?.currentTask;
  const userActions = currentTask?.userActions;
  const actionPermissions = currentTask?.actions;
  return {
    isAuthorized: (action: IUserAction['id']) =>
      (!!actionPermissions?.[action] || userActions?.find((a) => a.id === action)?.authorized) ?? false,
  };
}

export const buttonStyles: { [style in CBTypes.CustomButtonStyle]: { color: ButtonColor; variant: ButtonVariant } } = {
  primary: { variant: 'primary', color: 'success' },
  secondary: { variant: 'secondary', color: 'first' },
};

export const CustomButtonComponent = ({ node }: Props) => {
  const { textResourceBindings, actions, id, buttonStyle = 'secondary' } = node.item;
  const { isAuthorized } = useActionAuthorization();
  const { handleClientActions } = useHandleClientActions();
  const { performAction, mutation } = usePerformActionMutation();

  const isPermittedToPerformActions = actions.reduce((acc, action) => acc || isAuthorized(action.name), true);
  const disabled = !isPermittedToPerformActions || mutation.isLoading;

  const onClick = async () => {
    if (disabled) {
      return;
    }
    for (const action of actions) {
      if (isClientAction(action)) {
        await handleClientActions([action]);
      }
      if (isServerAction(action)) {
        await performAction({ action, buttonId: id });
      }
    }
  };

  const { color, variant } = buttonStyles[buttonStyle];

  return (
    <Button
      id={`custom-button-${id}`}
      disabled={disabled}
      onClick={onClick}
      color={color}
      variant={variant}
      aria-busy={mutation.isLoading}
    >
      <Lang id={textResourceBindings?.label} />
    </Button>
  );
};
