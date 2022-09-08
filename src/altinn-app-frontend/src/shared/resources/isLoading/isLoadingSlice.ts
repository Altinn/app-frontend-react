import { all, put, take } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { ApplicationMetadataActions } from 'src/shared/resources/applicationMetadata/applicationMetadataSlice';
import { ApplicationSettingsActions } from 'src/shared/resources/applicationSettings/applicationSettingsSlice';
import { watcherFinishDataTaskIsloadingSaga } from 'src/shared/resources/isLoading/dataTask/dataTaskIsLoadingSagas';
import { watcherFinishStatelessIsLoadingSaga } from 'src/shared/resources/isLoading/stateless/statelessIsLoadingSagas';
import { LanguageActions } from 'src/shared/resources/language/languageSlice';
import { OrgsActions } from 'src/shared/resources/orgs/orgsSlice';
import { QueueActions } from 'src/shared/resources/queue/queueSlice';
import { TextResourcesActions } from 'src/shared/resources/textResources/textResourcesSlice';
import { createSagaSlice } from 'src/shared/resources/utils/sagaSlice';
import type { MkActionType } from 'src/shared/resources/utils/sagaSlice';

export interface IIsLoadingState {
  appTask: boolean;
  dataTask: boolean;
  stateless: boolean;
}

export const initialState: IIsLoadingState = {
  appTask: null,
  dataTask: null,
  stateless: null,
};

const isLoadingSlice = createSagaSlice(
  (mkAction: MkActionType<IIsLoadingState>) => ({
    name: 'isLoading',
    initialState,
    actions: {
      startAppTaskIsLoading: mkAction<void>({
        reducer: (state) => {
          state.appTask = true;
        },
      }),
      finishAppTaskIsLoading: mkAction<void>({
        saga: () =>
          function* (): SagaIterator {
            while (true) {
              yield take(QueueActions.startInitialAppTaskQueue);
              yield all([
                take(
                  ApplicationSettingsActions.fetchApplicationSettingsFulfilled,
                ),
                take(TextResourcesActions.fetchFulfilled),
                take(LanguageActions.fetchLanguageFulfilled),
                take(ApplicationMetadataActions.getFulfilled),
                take(FormLayoutActions.fetchSetsFulfilled),
                take(OrgsActions.fetchFulfilled),
              ]);

              yield put(IsLoadingActions.finishAppTaskIsLoading());
            }
          },
        reducer: (state) => {
          state.appTask = false;
        },
      }),
      startDataTaskIsLoading: mkAction<void>({
        reducer: (state) => {
          state.dataTask = true;
        },
      }),
      finishDataTaskIsLoading: mkAction<void>({
        saga: () => watcherFinishDataTaskIsloadingSaga,
        reducer: (state) => {
          state.dataTask = false;
        },
      }),
      startStatelessIsLoading: mkAction<void>({
        reducer: (state) => {
          state.stateless = true;
        },
      }),
      finishStatelessIsLoading: mkAction<void>({
        saga: () => watcherFinishStatelessIsLoadingSaga,
        reducer: (state) => {
          state.stateless = false;
        },
      }),
    },
  }),
);

export const IsLoadingActions = isLoadingSlice.actions;
export default isLoadingSlice;
