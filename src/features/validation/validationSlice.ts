import { runSingleFieldValidationSaga } from 'src/features/validation/singleFieldValidationSagas';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';
import type {
  IComponentBindingValidation,
  IComponentValidationResult,
  ILayoutValidationResult,
  IValidationResult,
  IValidations,
} from 'src/types';
import type { IValidationMessage } from 'src/utils/validation/types';

export interface IRunSingleFieldValidation {
  componentId: string;
  layoutId: string;
  dataModelBinding: string;
}

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

export interface IUpdateLayoutValidations {
  pageKey: string;
  validationResult: ILayoutValidationResult;
}

export interface IUpdateValidations {
  validationResult: IValidationResult;
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
      runSingleFieldValidation: mkAction<IRunSingleFieldValidation>({
        takeLatest: runSingleFieldValidationSaga,
      }),
      runSingleFieldValidationRejected: mkAction<IValidationActionRejected>({
        reducer: (state, action) => {
          if (action.payload.error) {
            const { error } = action.payload;
            state.error = error;
          }
        },
      }),
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
      updateLayoutValidation: mkAction<IUpdateLayoutValidations>({
        reducer: (state, action) => {
          const { pageKey, validationResult } = action.payload;
          state.validations[pageKey] = validationResult.validations;
          runFixedValidations(state, validationResult.fixedValidations ?? []);
        },
      }),
      updateValidations: mkAction<IUpdateValidations>({
        reducer: (state, action) => {
          const { validationResult } = action.payload;
          state.validations = validationResult.validations;
          runFixedValidations(state, validationResult.fixedValidations ?? []);
        },
      }),
    },
  }));

  ValidationActions = slice.actions;
  return slice;
};

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
