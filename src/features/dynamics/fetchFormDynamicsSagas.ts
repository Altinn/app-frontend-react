import { call, put, select } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { FormDynamicsActions } from 'src/features/dynamics/formDynamicsSlice';
import { tmpSagaInstanceData } from 'src/features/instance/InstanceContext';
import { QueueActions } from 'src/features/queue/queueSlice';
import { getLayoutSetIdForApplication } from 'src/utils/appMetadata';
import { httpGet } from 'src/utils/network/networking';
import { getFetchFormDynamicsUrl } from 'src/utils/urls/appUrlHelper';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { ILayoutSets, IRuntimeState } from 'src/types';

const layoutSetsSelector = (state: IRuntimeState) => state.formLayout.layoutsets;
const applicationMetadataSelector = (state: IRuntimeState) => state.applicationMetadata.applicationMetadata;

export function* fetchDynamicsSaga(): SagaIterator {
  try {
    const layoutSets: ILayoutSets = yield select(layoutSetsSelector);
    const instance = tmpSagaInstanceData.current;
    const application: IApplicationMetadata = yield select(applicationMetadataSelector);
    const layoutSetId = getLayoutSetIdForApplication(application, instance, layoutSets);
    const url = getFetchFormDynamicsUrl(layoutSetId);

    const result: any = yield call(httpGet, url);
    const data = result ? result.data : {};
    yield put(
      FormDynamicsActions.fetchFulfilled({
        apis: data.APIs,
        ruleConnection: data.ruleConnection,
        conditionalRendering: data.conditionalRendering,
      }),
    );
  } catch (error) {
    if (error.message?.includes('404')) {
      yield put(FormDynamicsActions.fetchRejected({ error: null }));
      window.logWarn('Dynamics not found:\n', error);
    } else {
      yield put(FormDynamicsActions.fetchRejected({ error }));
      yield put(QueueActions.dataTaskQueueError({ error }));
      window.logError('Fetching dynamics failed:\n', error);
    }
  }
}
