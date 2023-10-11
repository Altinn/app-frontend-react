import { call, put, select } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { preProcessLayout } from 'src/features/expressions/validation';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { tmpSagaInstanceData } from 'src/features/instance/InstanceContext';
import { ComponentConfigs } from 'src/layout/components.generated';
import { getLayoutSetIdForApplication } from 'src/utils/appMetadata';
import { httpGet } from 'src/utils/network/networking';
import { getLayoutSettingsUrl } from 'src/utils/urls/appUrlHelper';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { CompTypes, ILayout } from 'src/layout/layout';
import type { ILayoutSets, ILayoutSettings, IRuntimeState } from 'src/types';

export const layoutSetsSelector = (state: IRuntimeState) => state.formLayout.layoutsets;
export const applicationMetadataSelector = (state: IRuntimeState) => state.applicationMetadata.applicationMetadata;

type ComponentTypeCaseMapping = { [key: string]: CompTypes };
let componentTypeCaseMapping: ComponentTypeCaseMapping | undefined = undefined;
function getCaseMapping(): ComponentTypeCaseMapping {
  if (!componentTypeCaseMapping) {
    componentTypeCaseMapping = {};
    for (const type in ComponentConfigs) {
      componentTypeCaseMapping[type.toLowerCase()] = type as CompTypes;
    }
  }

  return componentTypeCaseMapping;
}

export function cleanLayout(layout: ILayout, validateExpressions = true): ILayout {
  const mapping = getCaseMapping();
  const newLayout = layout.map((component) => ({
    ...component,
    type: mapping[component.type.toLowerCase()] || component.type,
  })) as ILayout;

  validateExpressions && preProcessLayout(newLayout);

  return newLayout;
}

export function* fetchLayoutSettingsSaga(): SagaIterator {
  const layoutSets: ILayoutSets = yield select(layoutSetsSelector);
  const instance = tmpSagaInstanceData.current;
  const applicationMetadataState: IApplicationMetadata = yield select(applicationMetadataSelector);
  const layoutSetId = getLayoutSetIdForApplication(applicationMetadataState, instance, layoutSets);

  try {
    const settings: ILayoutSettings = yield call(httpGet, getLayoutSettingsUrl(layoutSetId));
    yield put(FormLayoutActions.fetchSettingsFulfilled({ settings }));
  } catch (error) {
    if (error?.response?.status === 404) {
      // We accept that the app does not have a settings.json as this is not default
      yield put(FormLayoutActions.fetchSettingsFulfilled({ settings: null }));
    } else {
      yield put(FormLayoutActions.fetchSettingsRejected({ error }));
      window.logError('Fetching layout settings failed:\n', error);
    }
  }
}
