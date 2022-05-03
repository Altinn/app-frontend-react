import { call, select } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import { get } from 'altinn-shared/utils';

import {
  fetchFormDataSaga,
  fetchFormDataInitialSaga,
  allowAnonymousSelector,
  watchFetchFormDataInitialSaga,
} from './fetchFormDataSagas';
import { appMetaDataSelector,
  instanceDataSelector,
  layoutSetsSelector,
  processStateSelector,
  currentSelectedPartyIdSelector
} from 'src/selectors/simpleSelectors';
import { getInitialStateMock } from 'src/../__mocks__/initialStateMock';
import { getFetchFormDataUrl, getStatelessFormDataUrl } from 'src/utils/appUrlHelper';
import { getCurrentTaskDataElementId, getDataTypeByLayoutSetId } from 'src/utils/appMetadata';
import FormDataActions from '../formDataActions';
import type { IApplication } from 'altinn-shared/types';
import type { ILayoutSets } from 'src/types';
import { GET_INSTANCEDATA_FULFILLED } from 'src/shared/resources/instanceData/get/getInstanceDataActionTypes';
import { fetchJsonSchemaFulfilled } from '../../datamodel/datamodelSlice';

describe('fetchFormDataSagas', () => {
  const mockInitialState = getInitialStateMock();
  const mockFormData = {
    someField: 'test test',
    otherField: 'testing 123',
    group: {
      groupField: 'this is a field in a group',
    }
  };
  const flattenedFormData = {
    someField: 'test test',
    otherField: 'testing 123',
    'group.groupField': 'this is a field in a group',
  };
  it('should fetch form data', () => {
    const appMetadata = appMetaDataSelector(mockInitialState);
    const instance = instanceDataSelector(mockInitialState);
    const taskId = getCurrentTaskDataElementId(appMetadata, instance);
    const url = getFetchFormDataUrl(instance.id, taskId);

    expectSaga(fetchFormDataSaga)
    .provide([
      [select(appMetaDataSelector), {...mockInitialState.applicationMetadata.applicationMetadata}],
      [select(instanceDataSelector), {...mockInitialState.instanceData.instance}],
      [call(get, url), mockFormData],
    ])
    .put(FormDataActions.fetchFormDataFulfilled({ formData: flattenedFormData }))
    .run();
  });

  it('should fetch form data initial', () => {
    const appMetadata = appMetaDataSelector(mockInitialState);
    const instance = instanceDataSelector(mockInitialState);
    const taskId = getCurrentTaskDataElementId(appMetadata, instance);
    const url = getFetchFormDataUrl(instance.id, taskId);

    expectSaga(fetchFormDataInitialSaga)
    .provide([
      [select(appMetaDataSelector), {...mockInitialState.applicationMetadata.applicationMetadata}],
      [select(instanceDataSelector), {...mockInitialState.instanceData.instance}],
      [call(get, url), mockFormData],
    ])
    .put(FormDataActions.fetchFormDataFulfilled({ formData: flattenedFormData }))
    .run();
  });

  it('should fetch form data initial for stateless app', () => {
    const appMetadata: IApplication = {
      ...appMetaDataSelector(mockInitialState),
      onEntry: {
        show: 'stateless',
      },
    };
    const mockLayoutSets: ILayoutSets = {
      sets: [
        {
          id: 'stateless',
          dataType: 'test-data-model',
        },
      ],
    };

    const dataType = getDataTypeByLayoutSetId('stateless', mockLayoutSets);
    const url = getStatelessFormDataUrl(dataType);
    const options = {
      headers: {
        party: 'partyid:1234',
      },
    };

    expectSaga(fetchFormDataInitialSaga)
    .provide([
      [select(appMetaDataSelector), appMetadata],
      [select(layoutSetsSelector), mockLayoutSets],
      [select(allowAnonymousSelector), false],
      [select(currentSelectedPartyIdSelector), '1234'],
      [call(get, url, options), mockFormData],
    ])
    .put(FormDataActions.fetchFormDataFulfilled({ formData: flattenedFormData }))
    .run();
  });

  it('should fetch form data initial for stateless app with allowAnonymousOnStateless', () => {
    const appMetadata: IApplication = {
      ...appMetaDataSelector(mockInitialState),
      onEntry: {
        show: 'stateless',
      },
    };

    const mockLayoutSets: ILayoutSets = {
      sets: [
        {
          id: 'stateless',
          dataType: 'test-data-model',
        },
      ],
    };

    const dataType = getDataTypeByLayoutSetId('stateless', mockLayoutSets);
    const url = getStatelessFormDataUrl(dataType);
    const options = {};

    expectSaga(fetchFormDataInitialSaga)
    .provide([
      [select(appMetaDataSelector), appMetadata],
      [select(layoutSetsSelector), mockLayoutSets],
      [select(allowAnonymousSelector), true],
      [call(get, url, options), mockFormData],
    ])
    .put(FormDataActions.fetchFormDataFulfilled({ formData: flattenedFormData }))
    .run();
  });

  it('should trigger fetchFormDataInitialSaga', () => {
    const appMetadata = appMetaDataSelector(mockInitialState);
    const processState = processStateSelector(mockInitialState);
    const instance = instanceDataSelector(mockInitialState);

    expectSaga(watchFetchFormDataInitialSaga)
    .provide([
      [select(appMetaDataSelector), appMetadata],
      [select(instanceDataSelector), instance],
      [select(processStateSelector), processState],
    ])
    .take(GET_INSTANCEDATA_FULFILLED)
    .take(fetchJsonSchemaFulfilled)
    .call(fetchFormDataInitialSaga)
    .run();
  });

  it('should trigger fetchFormDataInitialSaga, stateless app', () => {
    const appMetadata = appMetaDataSelector(mockInitialState);

    expectSaga(watchFetchFormDataInitialSaga)
    .provide([
      [select(appMetaDataSelector), appMetadata],
      [select(allowAnonymousSelector), false],
    ])
    .take(fetchJsonSchemaFulfilled)
    .call(fetchFormDataInitialSaga)
    .run();
  });
})
