import { all, fork } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { rootSagas } from 'src/redux/sagaSlice';
import { sagaMiddleware } from 'src/redux/store';

function* root(): SagaIterator {
  yield all(rootSagas.map((saga) => fork(saga)));
}

export const initSagas = () => sagaMiddleware.run(root);
