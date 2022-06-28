import type { SagaIterator } from "redux-saga";
import { all, call, put, select, take, takeLatest } from "redux-saga/effects";
import type { IRuntimeState, IValidations, IUiConfig } from "src/types";
import FormDataActions from "../../data/formDataActions";
import type { IFormData } from "../../data/formDataReducer";
import { FormLayoutActions } from "../../layout/formLayoutSlice";
import { updateValidations } from "../../validation/validationSlice";
import * as FormDynamicsActionTypes from "../formDynamicsActionTypes";
import * as RulesActionTypes from "../../rules/rulesActionTypes";
import type { ILayouts } from "src/features/form/layout";
import {
  runDynamicsForLayouts,
  runLayoutDynamics,
} from "src/features/form/dynamics/layoutDynamics/runner";
import { buildInstanceContext } from "altinn-shared/utils/instanceContext";
import type { IApplicationSettings, IInstance } from "altinn-shared/types";

export const FormDataSelector: (store: IRuntimeState) => IFormData = (store) =>
  store.formData.formData;
export const FormLayoutsSelector: (store: IRuntimeState) => ILayouts = (
  store
) => store.formLayout.layouts;
export const UiConfigSelector: (store: IRuntimeState) => IUiConfig = (store) =>
  store.formLayout.uiConfig;
export const FormValidationSelector: (store: IRuntimeState) => IValidations = (
  store
) => store.formValidations.validations;
export const ApplicationSettingsSelector: (
  store: IRuntimeState
) => IApplicationSettings = (store) =>
  store.applicationSettings.applicationSettings;
export const InstanceSelector: (store: IRuntimeState) => IInstance = (store) =>
  store.instanceData?.instance;
export const LayoutOrderSelector: (store: IRuntimeState) => string[] = (
  store
) => store.formLayout.uiConfig.layoutOrder;

function* checkIfConditionalRulesShouldRunSaga(): SagaIterator {
  try {
    const formData: IFormData = yield select(FormDataSelector);
    const formLayouts: ILayouts = yield select(FormLayoutsSelector);
    const formValidations: IValidations = yield select(FormValidationSelector);
    const uiConfig: IUiConfig = yield select(UiConfigSelector);
    const applicationSettings: IApplicationSettings = yield select(
      ApplicationSettingsSelector
    );
    const instance: IInstance = yield select(InstanceSelector);
    const layoutOrder: string[] = yield select(LayoutOrderSelector);

    const instanceContext = buildInstanceContext(instance);

    const componentsToHide: string[] = runLayoutDynamics(
      (component) => component.hidden2,
      formLayouts,
      formData,
      instanceContext,
      applicationSettings,
      uiConfig.repeatingGroups
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

    const hiddenLayouts: string[] = runDynamicsForLayouts(
      formLayouts,
      formData,
      instanceContext,
      applicationSettings
    );

    const layouts = Object.keys(formLayouts);
    const newLayoutOrder = layouts.filter(
      (layout) => !hiddenLayouts.includes(layout)
    );

    if (shouldHiddenFieldsUpdate(layoutOrder, newLayoutOrder)) {
      yield put(FormLayoutActions.updateLayoutOrder({ order: newLayoutOrder }));
    }
  } catch (err) {
    yield call(console.error, err);
  }
}

export function* watchCheckIfConditionalRulesShouldRunSaga(): SagaIterator {
  yield takeLatest(
    FormDynamicsActionTypes.CHECK_IF_CONDITIONAL_RULE_SHOULD_RUN,
    checkIfConditionalRulesShouldRunSaga
  );
}

export function* waitForAppSetupBeforeRunningConditionalRulesSaga(): SagaIterator {
  while (true) {
    yield all([
      take(FormLayoutActions.fetchLayoutFulfilled),
      take(FormDataActions.fetchFormDataFulfilled),
      take(FormDynamicsActionTypes.FETCH_SERVICE_CONFIG_FULFILLED),
      take(RulesActionTypes.FETCH_RULE_MODEL_FULFILLED),
      take(FormLayoutActions.fetchLayoutSettingsFulfilled),
    ]);
    yield call(checkIfConditionalRulesShouldRunSaga);
  }
}

function shouldHiddenFieldsUpdate(
  currentList: string[],
  newList: string[]
): boolean {
  if (!currentList || currentList.length !== newList.length) {
    return true;
  }

  if (!currentList && newList && newList.length > 0) {
    return true;
  }

  if (currentList.find((element) => !newList.includes(element))) {
    return true;
  }

  return false;
}
