import { all, call, put as sagaPut, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AxiosRequestConfig } from 'axios';
import type { SagaIterator } from 'redux-saga';

import { FormDataActions } from 'src/features/form/data/formDataSlice';
import { FormDynamicsActions } from 'src/features/form/dynamics/formDynamicsSlice';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { ValidationActions } from 'src/features/form/validation/validationSlice';
import { makeGetAllowAnonymousSelector } from 'src/selectors/getAllowAnonymous';
import { ProcessActions } from 'src/shared/resources/process/processSlice';
import { Severity } from 'src/types';
import { getCurrentDataTypeForApplication, getCurrentTaskDataElementId, isStatelessApp } from 'src/utils/appMetadata';
import { convertDataBindingToModel, convertModelToDataBinding, filterOutInvalidData } from 'src/utils/databindings';
import { post } from 'src/utils/network/networking';
import { get, put } from 'src/utils/sharedUtils';
import { dataElementUrl, getStatelessFormDataUrl, getValidationUrl } from 'src/utils/urls/appUrlHelper';
import {
  canFormBeSaved,
  hasValidationsOfSeverity,
  mapDataElementValidationToRedux,
  mergeValidationObjects,
  runClientSideValidation,
} from 'src/utils/validation';
import type { IFormData } from 'src/features/form/data';
import type { ISubmitDataAction, IUpdateFormDataFulfilled } from 'src/features/form/data/formDataTypes';
import type { ILayoutState } from 'src/features/form/layout/formLayoutSlice';
import type { IRuntimeState, IRuntimeStore, IUiConfig, IValidationIssue } from 'src/types';

const LayoutSelector: (store: IRuntimeStore) => ILayoutState = (store: IRuntimeStore) => store.formLayout;
const UIConfigSelector: (store: IRuntimeStore) => IUiConfig = (store: IRuntimeStore) => store.formLayout.uiConfig;

export function* submitFormSaga({
  payload: { apiMode, stopWithWarnings },
}: PayloadAction<ISubmitDataAction>): SagaIterator {
  try {
    const state: IRuntimeState = yield select();
    const { model, validationResult, componentSpecificValidations, emptyFieldsValidations } =
      runClientSideValidation(state);

    validationResult.validations = mergeValidationObjects(
      validationResult.validations,
      componentSpecificValidations,
      apiMode === 'Complete' ? emptyFieldsValidations : null,
    );
    const { validations } = validationResult;
    if (!canFormBeSaved(validationResult, apiMode)) {
      yield sagaPut(ValidationActions.updateValidations({ validations }));
      return yield sagaPut(FormDataActions.submitRejected({ error: null }));
    }

    yield call(putFormData, { state, model });
    if (apiMode === 'Complete') {
      yield call(submitComplete, state, stopWithWarnings);
    }
    yield sagaPut(FormDataActions.submitFulfilled());
  } catch (error) {
    console.error(error);
    yield sagaPut(FormDataActions.submitRejected({ error }));
  }
}

function* submitComplete(state: IRuntimeState, stopWithWarnings: boolean | undefined) {
  // run validations against the datamodel
  const instanceId = state.instanceData.instance?.id;
  const serverValidation: IValidationIssue[] | undefined = instanceId
    ? yield call(get, getValidationUrl(instanceId))
    : undefined;

  // update validation state
  const layoutState: ILayoutState = yield select(LayoutSelector);
  const mappedValidations = mapDataElementValidationToRedux(
    serverValidation,
    layoutState.layouts,
    state.textResources.resources,
  );
  yield sagaPut(ValidationActions.updateValidations({ validations: mappedValidations }));
  const hasErrors = hasValidationsOfSeverity(mappedValidations, Severity.Error);
  const hasWarnings = hasValidationsOfSeverity(mappedValidations, Severity.Warning);
  if (hasErrors || (stopWithWarnings && hasWarnings)) {
    // we have validation errors or warnings that should be shown, do not submit
    return yield sagaPut(FormDataActions.submitRejected({ error: null }));
  }

  if (layoutState.uiConfig.currentViewCacheKey) {
    // Reset cache for current page when ending process task
    localStorage.removeItem(layoutState.uiConfig.currentViewCacheKey);
    yield sagaPut(FormLayoutActions.setCurrentViewCacheKey({ key: undefined }));
  }

  // data has no validation errors, we complete the current step
  return yield sagaPut(ProcessActions.complete());
}

function createFormDataRequest(
  state: IRuntimeState,
  model: any,
  field: string | undefined,
  componentId: string | undefined,
): { data: any; options?: AxiosRequestConfig } {
  if (state.backendFeatures.multiPartSave) {
    const changes = {
      'Some.Path': 'prev-value',
    };

    const data = new FormData();
    data.append('dataModel', JSON.stringify(model));
    data.append('changes', JSON.stringify(changes));
    return { data };
  }

  const options: AxiosRequestConfig = {
    headers: {
      'X-DataField': (field && encodeURIComponent(field)) || 'undefined',
      'X-ComponentId': (componentId && encodeURIComponent(componentId)) || 'undefined',
    },
  };

  return { data: model, options };
}

export function* putFormData({ state, model, field, componentId }: SaveDataParams) {
  // updates the default data element
  const defaultDataElementGuid = getCurrentTaskDataElementId(
    state.applicationMetadata.applicationMetadata,
    state.instanceData.instance,
    state.formLayout.layoutsets,
  );
  if (!defaultDataElementGuid) {
    return;
  }

  try {
    const { data, options } = createFormDataRequest(state, model, field, componentId);
    const responseData = yield call(put, dataElementUrl(defaultDataElementGuid), data, options);
    yield call(handleChangedFields, responseData?.changedFields);
  } catch (error) {
    if (error.response && error.response.status === 303) {
      // 303 means that data has been changed by calculation on server. Try to update from response.
      // Newer backends might not reply back with this special response code when there are changes, they
      // will just respond with the 'changedFields' property instead (see code handling this above).
      if (error.response.data?.changedFields) {
        yield call(handleChangedFields, error.response.data?.changedFields);
      } else if (defaultDataElementGuid) {
        // No changedFields property returned, try to fetch
        yield sagaPut(
          FormDataActions.fetch({
            url: dataElementUrl(defaultDataElementGuid),
          }),
        );
      }
    } else {
      throw error;
    }
  }
}

/**
 * When asked to save the data model, the server will execute ProcessDataWrite(), which may mutate the data model and
 * add new data/remove data from it. If that happens, we need to inject those changes back into our data model.
 */
function* handleChangedFields(changedFields?: IFormData) {
  if (!changedFields) {
    return;
  }

  yield all(
    Object.keys(changedFields).map((fieldKey) =>
      sagaPut(
        FormDataActions.update({
          data: changedFields[fieldKey]?.toString(),
          field: fieldKey,
          skipValidation: true,
          skipAutoSave: true,
        }),
      ),
    ),
  );

  yield sagaPut(FormLayoutActions.initRepeatingGroups());
}

export function* saveFormDataSaga({
  payload: { field, componentId, singleFieldValidation },
}: PayloadAction<IUpdateFormDataFulfilled>): SagaIterator {
  try {
    const state: IRuntimeState = yield select();
    // updates the default data element
    const application = state.applicationMetadata.applicationMetadata;
    const model = convertDataBindingToModel(
      filterOutInvalidData({
        data: state.formData.formData,
        invalidKeys: state.formValidations.invalidDataTypes,
      }),
    );

    if (isStatelessApp(application)) {
      yield call(saveStatelessData, { state, model, field, componentId });
    } else {
      // app with instance
      yield call(putFormData, { state, model, field, componentId });
    }

    if (singleFieldValidation && componentId) {
      yield sagaPut(
        ValidationActions.runSingleFieldValidation({
          componentId,
          dataModelBinding: singleFieldValidation.dataModelBinding,
          layoutId: singleFieldValidation.layoutId,
        }),
      );
    }

    yield sagaPut(FormDataActions.submitFulfilled());
  } catch (error) {
    console.error(error);
    yield sagaPut(FormDataActions.submitRejected({ error }));
  }
}

interface SaveDataParams {
  state: IRuntimeState;
  model: any;
  field?: string;
  componentId?: string;
}

export function* saveStatelessData({ state, model, field, componentId }: SaveDataParams) {
  const allowAnonymous = yield select(makeGetAllowAnonymousSelector());
  let headers: AxiosRequestConfig['headers'] = {
    'X-DataField': (field && encodeURIComponent(field)) || 'undefined',
    'X-ComponentId': (componentId && encodeURIComponent(componentId)) || 'undefined',
  };
  if (!allowAnonymous) {
    const selectedPartyId = state.party.selectedParty?.partyId;
    headers = {
      ...headers,
      party: `partyid:${selectedPartyId}`,
    };
  }

  const currentDataType = getCurrentDataTypeForApplication({
    application: state.applicationMetadata.applicationMetadata,
    instance: state.instanceData.instance,
    layoutSets: state.formLayout.layoutsets,
  });
  if (currentDataType) {
    const response = yield call(post, getStatelessFormDataUrl(currentDataType, allowAnonymous), { headers }, model);
    const formData = convertModelToDataBinding(response?.data);
    yield sagaPut(FormDataActions.fetchFulfilled({ formData }));
    yield sagaPut(FormDynamicsActions.checkIfConditionalRulesShouldRun({}));
  }
}

export function* autoSaveSaga({
  payload: { skipAutoSave, field, componentId, singleFieldValidation },
}: PayloadAction<IUpdateFormDataFulfilled>): SagaIterator {
  if (skipAutoSave) {
    return;
  }

  const uiConfig: IUiConfig = yield select(UIConfigSelector);
  if (uiConfig.autoSave !== false) {
    // undefined should default to auto save
    yield sagaPut(FormDataActions.save({ field, componentId, singleFieldValidation }));
  }
}
