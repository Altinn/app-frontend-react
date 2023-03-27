import { all, fork } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { sagaMiddleware } from 'src/store';
import { rootSagas } from 'src/utils/sagaSlice';

function* root(): SagaIterator {
  yield all(rootSagas.map((saga) => fork(saga)));
}

export const initSagas = () => sagaMiddleware.run(root);
