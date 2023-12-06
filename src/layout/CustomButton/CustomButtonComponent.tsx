import React from 'react';

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
import { flattenObject } from 'src/utils/databindings';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CustomAction, FrontendAction, UserAction } from 'src/layout/CustomButton/config.generated';
import type { IUserAction } from 'src/types/shared';

type Props = PropsFromGenericComponent<'CustomButton'>;

type UpdatedDataModels = Record<string, unknown>;

export type ActionResult = {
  updatedDataModels?: UpdatedDataModels;
  frontendActions?: FrontendAction[];
};

type UseHandleFrontendActions = {
  handleFrontendActions: (actions: FrontendAction[]) => Promise<void>;
  handleDataModelUpdate: (updatedDataModels: UpdatedDataModels) => Promise<void>;
};

type FrontendActionWithMetadata = FrontendAction & { metadata: unknown };

/**
 * A type guard to check if the action is an action that can be run entirely on the frontend
 */
const isFrontendAction = (action: CustomAction): action is FrontendAction => action.name.startsWith('$');
const isUserAction = (action: CustomAction): action is UserAction => !isFrontendAction(action);
const hasMetadata = (action: CustomAction): action is FrontendActionWithMetadata => 'metadata' in action;

type FrontendActionHandlers = {
  [Action in FrontendAction as Action['name']]: Action extends { metadata: infer Metadata }
    ? (params: Metadata) => Promise<void>
    : () => Promise<void>;
};

function useHandleFrontendActions(): UseHandleFrontendActions {
  const dispatch = useAppDispatch();
  const currentDataModelGuid = useCurrentDataModelGuid();

  const { next, previous, navigateToPage } = useNavigatePage();

  const frontendActions: FrontendActionHandlers = {
    $nextPage: async () => navigateToPage(next),
    $previousPage: async () => navigateToPage(previous),
    $navigateToPage: async ({ page }) => navigateToPage(page),
  };

  const _handleAction = async (action: FrontendAction) => {
    /**
     * We pad these with the $ letter in case the backend
     * returns frontendAction names without the $ prefix.
     */
    const functionName = action.name.startsWith('$') ? action.name : `$${action.name}`;

    const frontendActionFn = frontendActions[functionName];
    if (!hasMetadata(action)) {
      return await frontendActionFn();
    }

    await frontendActionFn(action.metadata);
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

type PerformActionMutationProps = {
  action: CustomAction;
  buttonId: string;
};

type UsePerformActionMutation = {
  mutation: UseMutationResult<ActionResult>;
  performAction: (props: PerformActionMutationProps) => Promise<void>;
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
  const { handleFrontendActions, handleDataModelUpdate } = useHandleFrontendActions();

  return {
    mutation,
    /**
     * We wrap the mutation in a promise to make it possible to await both the mutation,
     * and the side effects that are run in the onSuccess or onError callbacks.
     */
    performAction: ({ action, buttonId }: PerformActionMutationProps) =>
      new Promise((resolve, reject) =>
        mutation.mutate(
          { action, buttonId },
          {
            onSuccess: async (data) => {
              if (data.updatedDataModels) {
                await handleDataModelUpdate(data.updatedDataModels);
              }
              if (data.frontendActions) {
                await handleFrontendActions(data.frontendActions);
              }

              resolve();
            },
            onError: async (error) => {
              //TODO Show toast.
              reject(error);
            },
          },
        ),
      ),
  };
}

export function useActionAuthorization() {
  const userActions = useLaxProcessData()?.currentTask?.userActions;
  return {
    isAuthorized: (action: IUserAction['id']) => userActions?.find((a) => a.id === action)?.authorized ?? false,
  };
}

export const CustomButtonComponent = ({ node }: Props) => {
  const { textResourceBindings, actions, id } = node.item;
  const { isAuthorized } = useActionAuthorization();
  const { handleFrontendActions } = useHandleFrontendActions();
  const { performAction, mutation } = usePerformActionMutation();

  const isPermittedToPerformActions = actions.reduce((acc, action) => acc || isAuthorized(action.name), true);
  const disabled = !isPermittedToPerformActions || mutation.isLoading;

  const onClick = async () => {
    if (disabled) {
      return;
    }
    for (const action of actions) {
      if (isFrontendAction(action)) {
        await handleFrontendActions([action]);
      }
      if (isUserAction(action)) {
        await performAction({ action, buttonId: id });
      }
    }
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
