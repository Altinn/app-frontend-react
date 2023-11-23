import { put } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';

import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import type { IUpdateRepeatingGroupsEditIndex } from 'src/features/form/layout/formLayoutTypes';

export function* updateRepeatingGroupEditIndexSaga({
  payload: { group, index, shouldAddRow },
}: PayloadAction<IUpdateRepeatingGroupsEditIndex>): SagaIterator {
  if (shouldAddRow) {
    yield put(FormLayoutActions.repGroupAddRow({ groupId: group }));
  }
  yield put(
    FormLayoutActions.updateRepeatingGroupsEditIndexFulfilled({
      group,
      index,
    }),
  );
}
