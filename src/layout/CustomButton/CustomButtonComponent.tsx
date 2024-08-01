import React from 'react';
import { toast } from 'react-toastify';

import { Button } from '@digdir/designsystemet-react';
import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { useOnPageNavigationValidation } from 'src/features/validation/callbacks/onPageNavigationValidation';
import { useNavigatePage, useNavigationParams } from 'src/hooks/useNavigatePage';
import { isSpecificClientAction } from 'src/layout/CustomButton/typeHelpers';
import { promisify } from 'src/utils/promisify';
import type { BackendValidationIssueGroups } from 'src/features/validation';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ButtonColor, ButtonVariant } from 'src/layout/Button/WrappedButton';
import type * as CBTypes from 'src/layout/CustomButton/config.generated';
import type { ClientActionHandlers } from 'src/layout/CustomButton/typeHelpers';
import type { IUserAction } from 'src/types/shared';

type Props = PropsFromGenericComponent<'CustomButton'>;

type UpdatedDataModels = {
  [dataModelGuid: string]: object;
};

type UpdatedValidationIssues = {
  [dataModelGuid: string]: BackendValidationIssueGroups;
};

type FormDataLockTools = ReturnType<typeof FD.useLocking>;

export type ActionResult = {
  updatedDataModels?: UpdatedDataModels;
  updatedValidationIssues?: UpdatedValidationIssues;
  clientActions?: CBTypes.ClientAction[];
  redirectUrl: string;
};

type UseHandleClientActions = {
  handleClientActions: (actions: CBTypes.ClientAction[]) => Promise<void>;
  handleDataModelUpdate: (lockTools: FormDataLockTools, result: ActionResult) => Promise<void>;
};

class NotYetImplementedError extends Error {
  constructor(message = '', ...args) {
    super(message, ...args);
    this.message = message;
  }
}

/**
 * A type guard to check if the action is an action that can be run entirely on the client
 */
const isClientAction = (action: CBTypes.CustomAction): action is CBTypes.ClientAction => action.type === 'ClientAction';
/**
 * A type guard to check if the action is an action that requires a server side call
 */
const isServerAction = (action: CBTypes.CustomAction): action is CBTypes.ServerAction => action.type === 'ServerAction';

function useHandleClientActions(): UseHandleClientActions {
  const currentDataModelGuid = useCurrentDataModelGuid();
  const { navigateToPage, navigateToNextPage, navigateToPreviousPage, exitSubForm } = useNavigatePage();
  const { isSubFormPage, mainPageKey } = useNavigationParams();

  const subFormActions = ['closeSubForm', 'validateSubForm'];
  const frontendActions: ClientActionHandlers = {
    nextPage: promisify(navigateToNextPage),
    previousPage: promisify(navigateToPreviousPage),
    navigateToPage: promisify<ClientActionHandlers['navigateToPage']>(async ({ page }) => navigateToPage(page)),
    closeSubForm: promisify(exitSubForm),
    validateSubForm: promisify(() => {
      throw new NotYetImplementedError();
    }),
  };

  const handleClientAction = async (action: CBTypes.ClientAction) => {
    if (action.id == null) {
      window.logError('Client action is missing id. Did you provide the id of the action? Action:', action);
      return;
    }
    if (isSpecificClientAction('navigateToPage', action)) {
      return await frontendActions[action.id](action.metadata);
    }

    if ((!isSubFormPage || !mainPageKey) && subFormActions.includes(action.id)) {
      throw new Error('SubFormAction is only applicable for sub-forms');
    }

    await frontendActions[action.id]();
  };

  return {
    handleClientActions: async (actions) => {
      for (const action of actions) {
        await handleClientAction(action);
      }
    },
    handleDataModelUpdate: async (lockTools, result) => {
      const newDataModel =
        currentDataModelGuid && result.updatedDataModels ? result.updatedDataModels[currentDataModelGuid] : undefined;
      const validationIssues =
        currentDataModelGuid && result.updatedValidationIssues
          ? result.updatedValidationIssues[currentDataModelGuid]
          : undefined;

      if (newDataModel && validationIssues) {
        lockTools.unlock({
          newDataModel,
          validationIssues,
        });
      } else {
        lockTools.unlock();
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
  handleServerAction: (props: PerformActionMutationProps) => Promise<void>;
};

function useHandleServerActionMutation(lockTools: FormDataLockTools): UsePerformActionMutation {
  const { doPerformAction } = useAppMutations();
  const { partyId, instanceGuid } = useNavigationParams();
  const { handleClientActions, handleDataModelUpdate } = useHandleClientActions();

  const mutation = useMutation({
    mutationFn: async ({ action, buttonId }: PerformActionMutationProps) => {
      if (!instanceGuid || !partyId) {
        throw Error('Cannot perform action without partyId and instanceGuid');
      }
      return doPerformAction(partyId, instanceGuid, { action: action.id, buttonId });
    },
  });

  return {
    mutation,
    handleServerAction: async ({ action, buttonId }: PerformActionMutationProps) => {
      await lockTools.lock();
      try {
        const result = await mutation.mutateAsync({ action, buttonId });
        await handleDataModelUpdate(lockTools, result);
        if (result.clientActions) {
          await handleClientActions(result.clientActions);
        }
      } catch (error) {
        lockTools.unlock();
        if (error?.response?.data?.error?.message !== undefined) {
          toast(<Lang id={error?.response?.data?.error?.message} />, { type: 'error' });
        } else {
          toast(<Lang id='custom_actions.general_error' />, { type: 'error' });
        }
      }
    },
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

export const buttonStyles: { [style in CBTypes.ButtonStyle]: { color: ButtonColor; variant: ButtonVariant } } = {
  primary: { variant: 'primary', color: 'success' },
  secondary: { variant: 'secondary', color: 'first' },
};

export const CustomButtonComponent = ({ node }: Props) => {
  const { textResourceBindings, actions, id, buttonStyle, buttonColor, buttonSize } = node.item;
  const lockTools = FD.useLocking(node.item.id);
  const { isAuthorized } = useActionAuthorization();
  const { handleClientActions } = useHandleClientActions();
  const { handleServerAction, mutation } = useHandleServerActionMutation(lockTools);
  const onPageNavigationValidation = useOnPageNavigationValidation();

  const getScrollPosition = React.useCallback(
    () => document.querySelector(`[data-componentid="${id}"]`)?.getClientRects().item(0)?.y,
    [id],
  );

  const isPermittedToPerformActions = actions
    .filter((action) => action.type === 'ServerAction')
    .reduce((acc, action) => acc && isAuthorized(action.id), true);
  const disabled = !isPermittedToPerformActions || mutation.isPending;

  const isSubFormCloseButton = actions.filter((action) => action.id === 'closeSubForm').length > 0;
  let interceptedButtonStyle = buttonStyle ?? 'secondary';

  if (isSubFormCloseButton && !buttonStyle) {
    interceptedButtonStyle = 'primary';
  }

  let buttonText = textResourceBindings?.title;
  if (isSubFormCloseButton && !buttonText) {
    buttonText = 'general.done';
  }

  /**
   * This is borrowed from NavigationButtonsComponent, but doesn't seem to scroll quite far enough
   */
  // TODO: Investigate more and possibly fix the scroll offset
  const resetScrollPosition = (prevScrollPosition: number | undefined) => {
    if (prevScrollPosition === undefined) {
      return;
    }
    let attemptsLeft = 10;
    const check = () => {
      attemptsLeft--;
      if (attemptsLeft <= 0) {
        return;
      }
      const newScrollPosition = getScrollPosition();
      if (newScrollPosition !== undefined && newScrollPosition !== prevScrollPosition) {
        window.scrollBy({ top: newScrollPosition - prevScrollPosition });
      } else {
        requestAnimationFrame(check);
      }
    };
    requestAnimationFrame(check);
  };

  const onClick = async () => {
    if (disabled) {
      return;
    }
    for (const action of actions) {
      if (action.validation) {
        const prevScrollPosition = getScrollPosition();
        const hasErrors = await onPageNavigationValidation(node.top, action.validation);
        if (hasErrors) {
          resetScrollPosition(prevScrollPosition);
          return;
        }
      }

      if (isClientAction(action)) {
        await handleClientActions([action]);
      } else if (isServerAction(action)) {
        await handleServerAction({ action, buttonId: id });
      }
    }
  };

  const style = buttonStyles[interceptedButtonStyle];

  return (
    <Button
      id={`custom-button-${id}`}
      disabled={disabled}
      onClick={onClick}
      size={buttonSize}
      color={buttonColor ?? style.color}
      variant={style.variant}
      aria-busy={mutation.isPending}
    >
      <Lang id={buttonText} />
    </Button>
  );
};
