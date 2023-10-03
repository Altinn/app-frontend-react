import { select } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';

import { applicationMetadataMock } from 'src/__mocks__/applicationMetadataMock';
import { getInstanceDataMock } from 'src/__mocks__/instanceDataStateMock';
import { FormDataActions } from 'src/features/formData/formDataSlice';
import { IsLoadingActions } from 'src/features/isLoading/isLoadingSlice';
import {
  ApplicationMetadataSelector,
  startInitialInfoTaskQueueSaga,
  TextResourceSelector,
} from 'src/features/queue/infoTask/infoTaskQueueSaga';
import { tmpSagaInstanceData } from 'src/hooks/queries/useInstance';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { TextResourceMap } from 'src/features/textResources';

describe('infoTaskQueueSaga', () => {
  let textResources: TextResourceMap;

  beforeAll(() => {
    textResources = {
      text1: {
        value: 'some text',
      },
    };
  });

  it('startInitialInfoTaskQueueSaga, text resources with no variables', () => {
    tmpSagaInstanceData.current = getInstanceDataMock();
    return expectSaga(startInitialInfoTaskQueueSaga)
      .provide([
        [select(ApplicationMetadataSelector), applicationMetadataMock],
        [select(TextResourceSelector), textResources],
      ])
      .put(IsLoadingActions.startDataTaskIsLoading())
      .put(IsLoadingActions.finishDataTaskIsLoading())
      .run();
  });

  it('startInitialInfoTaskQueueSaga, text resources with variables should load form data', () => {
    const textsWithVariables = {
      ...textResources,
      someTextWithVariable: {
        value: '{0}',
        variables: [
          {
            dataSource: 'dataModel.testModel',
            key: 'someField',
          },
        ],
      },
    };
    const applicationMetadata: IApplicationMetadata = {
      ...applicationMetadataMock,
      dataTypes: [
        {
          id: 'testModel',
          allowedContentTypes: [''],
          maxCount: 1,
          minCount: 0,
        },
      ],
    };

    tmpSagaInstanceData.current = getInstanceDataMock();
    return expectSaga(startInitialInfoTaskQueueSaga)
      .provide([
        [select(ApplicationMetadataSelector), applicationMetadata],
        [select(TextResourceSelector), textsWithVariables],
      ])
      .put(IsLoadingActions.startDataTaskIsLoading())
      .put(FormDataActions.fetchFulfilled({ formData: {} }))
      .put(IsLoadingActions.finishDataTaskIsLoading())
      .run();
  });
});
