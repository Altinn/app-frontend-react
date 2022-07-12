import type { SagaIterator } from 'redux-saga';
import { call, select, put } from 'redux-saga/effects';
import type { IInstance } from 'altinn-shared/types';
import type { IApplicationMetadata } from 'src/shared/resources/applicationMetadata';
import { getRulehandlerUrl } from 'src/utils/appUrlHelper';
import { get } from '../../../../utils/networking';
import { getRuleModelFields } from '../../../../utils/rules';
import { QueueActions } from '../../../../shared/resources/queue/queueSlice';
import type { IRuntimeState, ILayoutSets } from '../../../../types';
import { getLayoutSetIdForApplication } from '../../../../utils/appMetadata';
import { FormRulesActions } from 'src/features/form/rules/rulesSlice';

const layoutSetsSelector = (state: IRuntimeState) =>
  state.formLayout.layoutsets;
const instanceSelector = (state: IRuntimeState) => state.instanceData.instance;
const applicationMetadataSelector = (state: IRuntimeState) =>
  state.applicationMetadata.applicationMetadata;

/**
 * Saga to retrive the rule configuration defining which rules to run for a given UI
 */
export function* fetchRuleModelSaga(): SagaIterator {
  try {
    const layoutSets: ILayoutSets = yield select(layoutSetsSelector);
    const instance: IInstance = yield select(instanceSelector);
    const application: IApplicationMetadata = yield select(
      applicationMetadataSelector,
    );
    const layoutSetId = getLayoutSetIdForApplication(
      application,
      instance,
      layoutSets,
    );

    const ruleModel = yield call(get, getRulehandlerUrl(layoutSetId));
    const scriptEle = window.document.createElement('script');
    scriptEle.innerHTML = ruleModel;
    window.document.body.appendChild(scriptEle);
    const ruleModelFields = getRuleModelFields();

    yield put(FormRulesActions.fetchFulfilled({ ruleModel: ruleModelFields }));
  } catch (error) {
    yield put(FormRulesActions.fetchRejected({ error }));
    yield put(QueueActions.dataTaskQueueError({ error }));
  }
}
