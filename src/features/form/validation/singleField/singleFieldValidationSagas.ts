import { call, put, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AxiosRequestConfig } from 'axios';
import type { SagaIterator } from 'redux-saga';

import { ValidationActions } from 'src/features/form/validation/validationSlice';
import { getCurrentTaskDataElementId } from 'src/utils/appMetadata';
import { get } from 'src/utils/network/networking';
import { getDataValidationUrl } from 'src/utils/urls/appUrlHelper';
import { mapDataElementValidationToRedux, mergeValidationObjects } from 'src/utils/validation';
import type { IRunSingleFieldValidation } from 'src/features/form/validation/validationSlice';
import type { IRuntimeState, IValidationIssue } from 'src/types';

export const selectFormLayoutState = (state: IRuntimeState) => state.formLayout;
export const selectLayoutsState = (state: IRuntimeState) => state.formLayout.layouts;
export const selectApplicationMetadataState = (state: IRuntimeState) => state.applicationMetadata.applicationMetadata;
export const selectInstanceState = (state: IRuntimeState) => state.instanceData.instance;
export const selectLayoutSets = (state: IRuntimeState) => state.formLayout.layoutsets;
export const selectTextResources = (state: IRuntimeState) => state.textResources.resources;
export const selectValidationsState = (state: IRuntimeState) => state.formValidations.validations;
export const selectHiddenFields = (state: IRuntimeState) => state.formLayout.uiConfig.hiddenFields;

export function* runSingleFieldValidationSaga({
  payload: { componentId, layoutId, dataModelBinding },
}: PayloadAction<IRunSingleFieldValidation>): SagaIterator {
  const applicationMetadata = yield select(selectApplicationMetadataState);
  const instance = yield select(selectInstanceState);
  const layoutSets = yield select(selectLayoutSets);

  const currentTaskDataId =
    applicationMetadata && getCurrentTaskDataElementId(applicationMetadata, instance, layoutSets);
  const url = instance && currentTaskDataId && getDataValidationUrl(instance.id, currentTaskDataId);

  if (url && dataModelBinding) {
    const options: AxiosRequestConfig = {
      headers: {
        ValidationTriggerField: dataModelBinding,
      },
    };

    try {
      const layouts = yield select(selectLayoutsState);
      const textResources = yield select(selectTextResources);
      const serverValidation: IValidationIssue[] = yield call(get, url, options);

      const mappedValidations = mapDataElementValidationToRedux(serverValidation, layouts || {}, textResources);
      const validationsFromState = yield select(selectValidationsState);
      const validations = mergeValidationObjects(validationsFromState, mappedValidations);

      // Reject validation if field is hidden
      const hiddenFields = yield select(selectHiddenFields);
      if (componentId in hiddenFields) {
        throw Error('Single field validation rejected as field is hidden for user');
      }

      // Replace/reset validations for field that triggered validation
      if (serverValidation.length === 0 && validations[layoutId]?.[componentId]) {
        validations[layoutId][componentId].simpleBinding = {
          errors: [],
          warnings: [],
        };
      } else if (mappedValidations[layoutId]?.[componentId]) {
        if (!validations[layoutId]) {
          validations[layoutId] = {};
        }
        validations[layoutId][componentId] = mappedValidations[layoutId][componentId];
      }

      yield put(ValidationActions.runSingleFieldValidationFulfilled({ validations }));
    } catch (error) {
      yield put(ValidationActions.runSingleFieldValidationRejected({ error }));
    }
  }
}
