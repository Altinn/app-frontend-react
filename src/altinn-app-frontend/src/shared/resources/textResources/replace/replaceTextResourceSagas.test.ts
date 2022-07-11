import { testSaga } from 'redux-saga-test-plan';
import { take } from 'redux-saga/effects';
import { FormDataActions } from 'src/features/form/data/formDataSlice';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import {
  replaceTextResourcesSaga,
  watchReplaceTextResourcesSaga,
} from './replaceTextResourcesSagas';
import { TextResourcesActions } from 'src/shared/resources/textResources/textResourcesSlice';

describe('watchReplaceTextResourcesSaga', () => {
  it('should wait for required data then take latest for relevant actions', () => {
    const saga = testSaga(watchReplaceTextResourcesSaga);
    saga
      .next()
      .all([
        take(TextResourcesActions.fetchFulfilled),
        take(FormDataActions.fetchFormDataFulfilled),
        take(FormLayoutActions.updateRepeatingGroupsFulfilled),
      ])
      .next()
      .call(replaceTextResourcesSaga)
      .next()
      .takeLatest(
        FormDataActions.fetchFormDataFulfilled,
        replaceTextResourcesSaga,
      )
      .next()
      .takeLatest(
        FormDataActions.updateFormDataFulfilled,
        replaceTextResourcesSaga,
      )
      .next()
      .takeLatest(
        FormDataActions.setFormDataFulfilled,
        replaceTextResourcesSaga,
      )
      .next()
      .takeLatest(TextResourcesActions.fetchFulfilled, replaceTextResourcesSaga)
      .next()
      .isDone();
  });
});
