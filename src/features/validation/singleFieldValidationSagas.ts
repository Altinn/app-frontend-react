import { call, put, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AxiosRequestConfig } from 'axios';
import type { SagaIterator } from 'redux-saga';

import { ValidationActions } from 'src/features/validation/validationSlice';
import { implementsNodeValidation } from 'src/layout';
import { getCurrentTaskDataElementId } from 'src/utils/appMetadata';
import { ResolvedNodesSelector } from 'src/utils/layout/hierarchy';
import { httpGet } from 'src/utils/network/networking';
import { getDataValidationUrl } from 'src/utils/urls/appUrlHelper';
import {
  createComponentValidationResult,
  filterValidationObjectsByComponentId,
  mapValidationIssues,
} from 'src/utils/validation/validationHelpers';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IRunSingleFieldValidation } from 'src/features/validation/validationSlice';
import type { ILayoutSets, IRuntimeState, IValidationIssue } from 'src/types';
import type { IInstance } from 'src/types/shared';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

export const selectLayoutsState = (state: IRuntimeState) => state.formLayout.layouts;
export const selectApplicationMetadataState = (state: IRuntimeState) => state.applicationMetadata.applicationMetadata;
export const selectInstanceState = (state: IRuntimeState) => state.instanceData.instance;
export const selectLayoutSetsState = (state: IRuntimeState) => state.formLayout.layoutsets;
export const selectTextResourcesState = (state: IRuntimeState) => state.textResources.resources;
export const selectValidationsState = (state: IRuntimeState) => state.formValidations.validations;
export const selectHiddenFieldsState = (state: IRuntimeState) => state.formLayout.uiConfig.hiddenFields;

export function* runSingleFieldValidationSaga({
  payload: { componentId, layoutId, dataModelBinding },
}: PayloadAction<IRunSingleFieldValidation>): SagaIterator {
  // Reject validation if field is hidden
  let hiddenFields: string[] = yield select(selectHiddenFieldsState);
  if (hiddenFields.includes(componentId)) {
    yield put(ValidationActions.runSingleFieldValidationRejected({}));
    return;
  }
  const resolvedNodes: LayoutPages = yield select(ResolvedNodesSelector);
  const node = resolvedNodes.findById(componentId);

  const applicationMetadata: IApplicationMetadata = yield select(selectApplicationMetadataState);
  const instance: IInstance = yield select(selectInstanceState);
  const layoutSets: ILayoutSets = yield select(selectLayoutSetsState);

  const currentTaskDataId: string | undefined =
    applicationMetadata && getCurrentTaskDataElementId(applicationMetadata, instance, layoutSets);
  const url: string | undefined = instance && currentTaskDataId && getDataValidationUrl(instance.id, currentTaskDataId);

  if (node && implementsNodeValidation(node.def) && url && dataModelBinding) {
    const options: AxiosRequestConfig = {
      headers: {
        ValidationTriggerField: dataModelBinding,
      },
    };

    try {
      const frontendValidationObjects = node.def.runValidations(node as any);
      const serverValidations: IValidationIssue[] = yield call(httpGet, url, options);
      const serverValidationObjects = mapValidationIssues(serverValidations);

      const validationObjects = filterValidationObjectsByComponentId(
        [...frontendValidationObjects, ...serverValidationObjects],
        componentId,
      );
      const validationResult = createComponentValidationResult(validationObjects);

      // Reject validation if field has been set to hidden in the time after we sent the validation request
      hiddenFields = yield select(selectHiddenFieldsState);
      if (hiddenFields.includes(componentId)) {
        yield put(ValidationActions.runSingleFieldValidationRejected({}));
        return;
      }

      yield put(
        ValidationActions.updateComponentValidations({ pageKey: node.pageKey(), componentId, validationResult }),
      );
    } catch (error) {
      yield put(ValidationActions.runSingleFieldValidationRejected({ error }));
    }
  }
}
