import { createSagaSlice } from 'src/redux/sagaSlice';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';
import type {
  IComponentBindingValidation,
  IComponentValidationResult,
  IValidationMessage,
  IValidationObject,
  IValidations,
} from 'src/utils/validation/types';

export interface IValidationState {
  validations: IValidations;
  invalidDataTypes: string[];
  error: Error | null;
}

export interface IUpdateComponentValidations {
  pageKey: string;
  validationResult: IComponentValidationResult;
  componentId: string;
  invalidDataTypes?: string[];
}

export interface IAddValidations {
  validationObjects: IValidationObject[];
}

export interface IValidationActionRejected {
  error?: Error;
}

export const initialState: IValidationState = {
  validations: {},
  error: null,
  invalidDataTypes: [],
};

export let ValidationActions: ActionsFromSlice<typeof validationSlice>;
export const validationSlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<IValidationState>) => ({
    name: 'formValidations',
    initialState,
    actions: {
      updateComponentValidations: mkAction<IUpdateComponentValidations>({
        reducer: (state, action) => {
          const { pageKey, validationResult, componentId, invalidDataTypes } = action.payload;

          if (!state.validations[pageKey]) {
            state.validations[pageKey] = {};
          }

          state.validations[pageKey][componentId] = validationResult.validations;
          runFixedValidations(state, validationResult.fixedValidations ?? []);

          state.invalidDataTypes = invalidDataTypes || [];
        },
      }),
    },
  }));

  ValidationActions = slice.actions;
  return slice;
};

/**
 * Applies fiexed validations to the state. This should be run after every validation update.
 */
function runFixedValidations(state: IValidationState, fixedValidations: IValidationMessage<'fixed'>[]) {
  for (const fixed of fixedValidations) {
    const { pageKey, componentId, bindingKey } = fixed;

    let bindingValidations: IComponentBindingValidation | undefined;
    if ((bindingValidations = state.validations[pageKey]?.[componentId]?.[bindingKey])) {
      const severities = Object.keys(bindingValidations);
      for (const severity of severities) {
        bindingValidations[severity] = bindingValidations[severity].filter(
          (message: string) => message !== fixed.message,
        );
      }
    }
  }
}
