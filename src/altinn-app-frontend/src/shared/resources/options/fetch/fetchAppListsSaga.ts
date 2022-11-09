import { SortDirection } from '@altinn/altinn-design-system';
import { call, fork, put, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';

import { appLanguageStateSelector } from 'src/selectors/appLanguageStateSelector';
import { listStateSelector } from 'src/selectors/appListStateSelector';
import { appListsActions } from 'src/shared/resources/options/appListsSlice';
import { getAppListLookupKey, getAppListLookupKeys } from 'src/utils/applist';
import { getAppListsUrl } from 'src/utils/appUrlHelper';
import {
  getKeyIndex,
  getKeyWithoutIndex,
  getKeyWithoutIndexIndicators,
  replaceIndexIndicatorsWithIndexes,
} from 'src/utils/databindings';
import { selectNotNull } from 'src/utils/sagas';
import type { IFormData } from 'src/features/form/data';
import type { IUpdateFormDataFulfilled } from 'src/features/form/data/formDataTypes';
import type { ILayouts } from 'src/features/form/layout';
import type {
  IAppList,
  IAppLists,
  IAppListsMetaData,
  IFetchSpecificAppListSaga,
  IRepeatingGroups,
  IRuntimeState,
} from 'src/types';

import { get } from 'altinn-shared/utils';

export const formLayoutSelector = (state: IRuntimeState): ILayouts | null => state.formLayout?.layouts;
export const formDataSelector = (state: IRuntimeState) => state.formData.formData;
export const appListsSelector = (state: IRuntimeState): IAppLists => state.appListState.appLists;
export const appListsWithIndexIndicatorsSelector = (state: IRuntimeState) =>
  state.appListState.appListsWithIndexIndicator;
export const instanceIdSelector = (state: IRuntimeState): string | undefined => state.instanceData.instance?.id;
export const repeatingGroupsSelector = (state: IRuntimeState) => state.formLayout?.uiConfig.repeatingGroups;

export function* fetchAppListsSaga(): SagaIterator {
  const layouts: ILayouts = yield selectNotNull(formLayoutSelector);
  const repeatingGroups: IRepeatingGroups = yield selectNotNull(repeatingGroupsSelector);
  const fetchedAppLists: string[] = [];
  const appListsWithIndexIndicators: IAppListsMetaData[] = [];
  for (const layoutId of Object.keys(layouts)) {
    for (const element of layouts[layoutId] || []) {
      if (element.type !== 'List' || !element.appListId) {
        continue;
      }

      const { appListId, mapping, secure } = element;

      const { keys, keyWithIndexIndicator } = getAppListLookupKeys({
        id: appListId,
        mapping,
        secure,
        repeatingGroups,
      });
      if (keyWithIndexIndicator) {
        appListsWithIndexIndicators.push(keyWithIndexIndicator);
      }

      if (!keys?.length) {
        continue;
      }

      for (const appListsObject of keys) {
        const { id, mapping, secure } = appListsObject;
        const lookupKey = getAppListLookupKey({ id, mapping });
        if (appListId && !fetchedAppLists.includes(lookupKey)) {
          yield fork(fetchSpecificAppListSaga, {
            appListId,
            dataMapping: mapping,
            secure,
          });
          fetchedAppLists.push(lookupKey);
        }
      }
    }
  }
  yield put(
    appListsActions.setAppListsWithIndexIndicators({
      appListsWithIndexIndicators,
    }),
  );
}

export function* fetchSpecificAppListSaga({ appListId, dataMapping, secure }: IFetchSpecificAppListSaga): SagaIterator {
  const key = getAppListLookupKey({ id: appListId, mapping: dataMapping });
  const instanceId = yield select(instanceIdSelector);
  try {
    const metaData: IAppListsMetaData = {
      id: appListId,
      mapping: dataMapping,
      secure,
    };
    yield put(appListsActions.fetching({ key, metaData }));
    const formData: IFormData = yield select(formDataSelector);
    const language = yield select(appLanguageStateSelector);
    const appList = yield select(listStateSelector);

    const pageSize = appList.appLists[appListId].size ? appList.appLists[appListId].size.toString() : '5';
    const pageNumber = appList.appLists[appListId].pageNumber ? appList.appLists[appListId].pageNumber.toString() : '0';
    const sortColumn = appList.appLists[appListId].sortColumn
      ? appList.appLists[appListId].sortColumn.toString()
      : null;
    const sortDirection = appList.appLists[appListId].sortDirection
      ? appList.appLists[appListId].sortDirection.toString()
      : SortDirection.NotActive;

    const url = getAppListsUrl({
      appListId,
      formData,
      language,
      dataMapping,
      secure,
      instanceId,
      pageSize,
      pageNumber,
      sortColumn,
      sortDirection,
    });

    const appLists: IAppList = yield call(get, url);
    yield put(
      appListsActions.fetchFulfilled({
        key,
        appLists: appLists.listItems,
        metadata: appLists._metaData,
      }),
    );
  } catch (error) {
    yield put(appListsActions.fetchRejected({ key: key, error }));
  }
}

export function* checkIfAppListsShouldRefetchSaga({
  payload: { field },
}: PayloadAction<IUpdateFormDataFulfilled>): SagaIterator {
  const appLists: IAppLists = yield select(appListsSelector);
  const appListsWithIndexIndicators = yield select(appListsWithIndexIndicatorsSelector);
  let foundInExistingAppLists = false;
  for (const appListKey of Object.keys(appLists)) {
    const dataMapping = appLists[appListKey].mapping;
    const appListId = appLists[appListKey].id;
    const secure = appLists[appListKey].secure;
    if (dataMapping && Object.keys(dataMapping).includes(field)) {
      foundInExistingAppLists = true;
      yield fork(fetchSpecificAppListSaga, {
        appListId,
        dataMapping,
        secure,
      });
    }
  }

  if (foundInExistingAppLists) {
    return;
  }

  for (const appLists of appListsWithIndexIndicators) {
    const { mapping, id, secure } = appLists;
    if (
      mapping &&
      Object.keys(mapping)
        .map((key) => getKeyWithoutIndexIndicators(key))
        .includes(getKeyWithoutIndex(field))
    ) {
      const keys = getKeyIndex(field);
      const newDataMapping = {};

      for (const key of Object.keys(mapping)) {
        newDataMapping[replaceIndexIndicatorsWithIndexes(key, keys)] = mapping[key];
      }
      yield fork(fetchSpecificAppListSaga, {
        appListId: id,
        dataMapping: newDataMapping,
        secure,
      });
    }
  }
}
