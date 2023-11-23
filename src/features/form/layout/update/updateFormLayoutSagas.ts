import { put, select, take } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';

import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { FormDataActions } from 'src/features/formData/formDataSlice';
import { getLayoutOrderFromPageOrderConfig, selectLayoutOrder } from 'src/selectors/getLayoutOrder';
import { waitFor } from 'src/utils/sagas';
import type { IMoveToNextPage, IUpdateCurrentView } from 'src/features/form/layout/formLayoutTypes';
import type { IRuntimeState, IUiConfig } from 'src/types';

export const selectFormLayoutState = (state: IRuntimeState) => state.formLayout;
export const selectFormData = (state: IRuntimeState) => state.formData.formData;
export const selectFormLayouts = (state: IRuntimeState) => state.formLayout.layouts;
export const selectAllLayouts = (state: IRuntimeState) => state.formLayout.uiConfig.pageOrderConfig.order;
export const selectCurrentLayout = (state: IRuntimeState) => state.formLayout.uiConfig.currentView;
const selectUiConfig = (state: IRuntimeState) => state.formLayout.uiConfig;

export function* updateCurrentViewSaga({
  payload: { newView, returnToView, skipPageCaching, keepScrollPos, focusComponentId, allowNavigationToHidden },
}: PayloadAction<IUpdateCurrentView>): SagaIterator {
  try {
    const uiConfig: IUiConfig = yield select(selectUiConfig);

    // When triggering navigation we should save the data if autoSaveBehavior === 'onChangePage'
    // But we should not save the data when currentView is hidden.
    // This happens on the initial page load
    if (uiConfig.autoSaveBehavior === 'onChangePage') {
      const visibleLayouts: string[] | null = yield select(selectLayoutOrder);
      if (visibleLayouts?.includes(uiConfig.currentView)) {
        yield put(FormDataActions.saveLatest({}));
        yield take(FormDataActions.submitFulfilled);
      }
    } else {
      // When triggering navigation to the next page, we need to make sure there are no unsaved changes. The action to
      // save it should be triggered elsewhere, but we should wait until the state settles before navigating.
      yield waitFor((state) => !state.formData.unsavedChanges);
    }

    const state: IRuntimeState = yield select();
    const visibleLayouts: string[] | null = yield select(selectLayoutOrder);
    const viewCacheKey = state.formLayout.uiConfig.currentViewCacheKey;
    const instanceId = state.deprecated.lastKnownInstance?.id;
    if (!viewCacheKey) {
      yield put(FormLayoutActions.setCurrentViewCacheKey({ key: instanceId }));
    }
    const currentViewCacheKey = viewCacheKey || instanceId;

    if (visibleLayouts && !visibleLayouts.includes(newView) && allowNavigationToHidden !== true) {
      yield put(
        FormLayoutActions.updateCurrentViewRejected({
          error: null,
          keepScrollPos,
        }),
      );
      return;
    }

    if (!skipPageCaching && currentViewCacheKey) {
      localStorage.setItem(currentViewCacheKey, newView);
    }
    yield put(
      FormLayoutActions.updateCurrentViewFulfilled({
        newView,
        returnToView,
        focusComponentId,
      }),
    );
  } catch (error) {
    yield put(FormLayoutActions.updateCurrentViewRejected({ error }));
    window.logError('Update view failed:\n', error);
  }
}

export function* moveToNextPageSaga({ payload: { keepScrollPos } }: PayloadAction<IMoveToNextPage>): SagaIterator {
  try {
    const state: IRuntimeState = yield select();
    const currentView = state.formLayout.uiConfig.currentView;

    if (!state.applicationMetadata.applicationMetadata) {
      yield put(FormLayoutActions.moveToNextPageRejected({ error: null }));
      return;
    }

    const returnToView = state.formLayout.uiConfig.returnToView;
    const layoutOrder = getLayoutOrderFromPageOrderConfig(state.formLayout.uiConfig.pageOrderConfig) || [];
    const newView = returnToView || layoutOrder[layoutOrder.indexOf(currentView) + 1];

    yield put(FormLayoutActions.updateCurrentView({ newView, keepScrollPos }));
  } catch (error) {
    yield put(FormLayoutActions.moveToNextPageRejected({ error }));
  }
}

/**
 * When hiding one or more pages, we cannot show them - so we'll have to make sure we navigate to the next one
 * in the page order (if currently on a page that is not visible).
 */
export function* findAndMoveToNextVisibleLayout(): SagaIterator {
  const allLayouts: string[] | null = yield select(selectAllLayouts);
  const visibleLayouts: string[] | null = yield select(selectLayoutOrder);
  const current: string = yield select(selectCurrentLayout);

  const possibleLayouts = new Set<string>(allLayouts || []);
  let nextVisiblePage = current;
  while (visibleLayouts && allLayouts && !visibleLayouts.includes(nextVisiblePage)) {
    const nextIndex = allLayouts.findIndex((l) => l === nextVisiblePage) + 1;
    nextVisiblePage = allLayouts[nextIndex];

    // Because findIndex() returns -1 when no item was found, the code above rolls around to index 0, and will
    // start looking at the first page again (which is intentional). However, if the state is broken we might
    // never find the visible layout, causing an infinite loop. This code just makes sure our ship is tight and
    // that loop can't happen.
    possibleLayouts.delete(nextVisiblePage);
    if (!possibleLayouts.size) {
      break;
    }
  }

  if (nextVisiblePage && nextVisiblePage !== current) {
    yield put(
      FormLayoutActions.updateCurrentViewFulfilled({
        newView: nextVisiblePage,
      }),
    );
  }
}
