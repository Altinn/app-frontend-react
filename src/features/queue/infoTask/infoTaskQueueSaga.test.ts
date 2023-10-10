import { select } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';

import { applicationMetadataMock } from 'src/__mocks__/applicationMetadataMock';
import { getInstanceDataMock } from 'src/__mocks__/instanceDataStateMock';
import { FormDataActions } from 'src/features/formData/formDataSlice';
import { tmpSagaInstanceData } from 'src/features/instance/InstanceContext';
import {
  ApplicationMetadataSelector,
  startInitialInfoTaskQueueSaga,
  TextResourceSelector,
} from 'src/features/queue/infoTask/infoTaskQueueSaga';
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
      .put(FormDataActions.fetchFulfilled({ formData: {} }))
      .run();
  });
});
