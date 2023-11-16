import { put, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';

import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { getCurrentTaskDataElementId } from 'src/utils/appMetadata';
import { ResolvedNodesSelector } from 'src/utils/layout/hierarchy';
import type { IUpdateRepeatingGroupsEditIndex } from 'src/features/form/layout/formLayoutTypes';
import type { IRuntimeState } from 'src/types';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

export function* updateRepeatingGroupEditIndexSaga({
  payload: { group, index, validate, shouldAddRow },
}: PayloadAction<IUpdateRepeatingGroupsEditIndex>): SagaIterator {
  try {
    const state: IRuntimeState = yield select();
    const resolvedNodes: LayoutPages = yield select(ResolvedNodesSelector);
    const instance = state.deprecated.lastKnownInstance;
    const rowIndex = state.formLayout.uiConfig.repeatingGroups?.[group].editIndex;
    const groupNode = resolvedNodes.findById(group);

    if (validate && groupNode?.isType('Group') && typeof rowIndex === 'number' && rowIndex > -1) {
      if (!state.applicationMetadata.applicationMetadata || !instance || !state.formLayout.layouts) {
        yield put(
          FormLayoutActions.updateRepeatingGroupsEditIndexRejected({
            error: null,
            group,
          }),
        );
        return;
      }

      const currentTaskDataId = getCurrentTaskDataElementId({
        application: state.applicationMetadata.applicationMetadata,
        instance,
        process: state.deprecated.lastKnownProcess,
        layoutSets: state.formLayout.layoutsets,
      });

      if (!currentTaskDataId) {
        yield put(
          FormLayoutActions.updateRepeatingGroupsEditIndexRejected({
            error: null,
            group,
          }),
        );
        return;
      }

      /**
       * TODO(Validation): Check validation provider if there are errors in any fields in the group
       * This saga probably needs to be rewritten to a hook first, since the sagas do not have acces to this provider.
       */
      // eslint-disable-next-line sonarjs/no-gratuitous-expressions, no-constant-condition
      if (true) {
        if (shouldAddRow) {
          yield put(FormLayoutActions.repGroupAddRow({ groupId: group }));
        }
        yield put(
          FormLayoutActions.updateRepeatingGroupsEditIndexFulfilled({
            group,
            index,
          }),
        );
      } else {
        yield put(
          FormLayoutActions.updateRepeatingGroupsEditIndexRejected({
            error: null,
            group,
          }),
        );
      }
    } else {
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
  } catch (error) {
    yield put(FormLayoutActions.updateRepeatingGroupsEditIndexRejected({ error, group }));
    window.logError(`Updating edit index for repeating group (${group}) failed:\n`, error);
  }
}
