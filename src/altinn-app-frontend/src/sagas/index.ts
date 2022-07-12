import type { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import Attachments from '../shared/resources/attachments/attachmentSagas';
import { sagaMiddleware } from 'src/store';
import { rootSagas } from 'src/shared/resources/utils/sagaSlice';

function* root(): SagaIterator {
  yield fork(Attachments);

  for (const sliceSaga of rootSagas) {
    yield fork(sliceSaga);
  }
}

export const initSagas = () => sagaMiddleware.run(root);
