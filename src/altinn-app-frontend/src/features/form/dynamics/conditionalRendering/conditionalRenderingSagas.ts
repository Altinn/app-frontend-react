import type { SagaIterator } from 'redux-saga';
import { all, call, put, select, take, takeLatest } from 'redux-saga/effects';
import type { IRuntimeState, IValidations, IUiConfig } from 'src/types';
import { runConditionalRenderingRules } from '../../../../utils/conditionalRendering';
import FormDataActions from '../../data/formDataActions';
import type { IFormData } from '../../data/formDataReducer';
import { FormLayoutActions } from '../../layout/formLayoutSlice';
import { updateValidations } from '../../validation/validationSlice';
import * as RulesActionTypes from '../../rules/rulesActionTypes';
import { FormDynamicsActions } from 'src/features/form/dynamics/formDynamicsSlice';
import type { IConditionalRenderingRules } from 'src/features/form/dynamics';

export const ConditionalRenderingSelector: (store: IRuntimeState) => any = (
  store: IRuntimeState,
) => store.formDynamics.conditionalRendering;
export const FormDataSelector: (store: IRuntimeState) => IFormData = (store) =>
  store.formData.formData;
export const UiConfigSelector: (store: IRuntimeState) => IUiConfig = (store) =>
  store.formLayout.uiConfig;
export const FormValidationSelector: (store: IRuntimeState) => IValidations = (
  store,
) => store.formValidations.validations;

function* checkIfConditionalRulesShouldRunSaga(): SagaIterator {
  try {
    const conditionalRenderingState: IConditionalRenderingRules = yield select(
      ConditionalRenderingSelector,
    );
    const formData: IFormData = yield select(FormDataSelector);
    const formValidations: IValidations = yield select(FormValidationSelector);
    const uiConfig: IUiConfig = yield select(UiConfigSelector);
    const componentsToHide: string[] = runConditionalRenderingRules(
      conditionalRenderingState,
      formData,
      uiConfig.repeatingGroups,
    );

    if (shouldHiddenFieldsUpdate(uiConfig.hiddenFields, componentsToHide)) {
      yield put(FormLayoutActions.updateHiddenComponents({ componentsToHide }));
      componentsToHide.forEach((componentId) => {
        if (formValidations[componentId]) {
          const newFormValidations = formValidations;
          delete formValidations[componentId];
          updateValidations({ validations: newFormValidations });
        }
      });
    }
  } catch (err) {
    yield call(console.error, err);
  }
}

export function* watchCheckIfConditionalRulesShouldRunSaga(): SagaIterator {
  yield takeLatest(
    FormDynamicsActions.checkIfConditionalRulesShouldRun,
    checkIfConditionalRulesShouldRunSaga,
  );
}

export function* waitForAppSetupBeforeRunningConditionalRulesSaga(): SagaIterator {
  while (true) {
    yield all([
      take(FormLayoutActions.fetchLayoutFulfilled),
      take(FormDataActions.fetchFormDataFulfilled),
      take(FormDynamicsActions.fetchFormDynamicsFulfilled),
      take(RulesActionTypes.FETCH_RULE_MODEL_FULFILLED),
    ]);
    yield call(checkIfConditionalRulesShouldRunSaga);
  }
}

function shouldHiddenFieldsUpdate(
  currentList: string[],
  newList: string[],
): boolean {
  if (!currentList || currentList.length !== newList.length) {
    return true;
  }

  if (!currentList && newList && newList.length > 0) {
    return true;
  }

  return !!currentList.find((element) => !newList.includes(element));
}
