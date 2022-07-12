import type { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import InstantiationSagas from '../features/instantiate/instantiation/sagas';
import ApplicationMetadataSagas from '../shared/resources/applicationMetadata/sagas';
import Attachments from '../shared/resources/attachments/attachmentSagas';
import { sagaMiddleware } from 'src/store';
import { rootSagas } from 'src/shared/resources/utils/sagaSlice';

function* root(): SagaIterator {
  yield fork(Attachments);
  yield fork(ApplicationMetadataSagas);
  yield fork(InstantiationSagas);

  for (const sliceSaga of rootSagas) {
    yield fork(sliceSaga);
  }
}

export const initSagas = () => sagaMiddleware.run(root);
