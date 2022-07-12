import type { IQueueError, IQueueState } from '.';
import type { MkActionType } from 'src/shared/resources/utils/sagaSlice';
import { createSagaSlice } from 'src/shared/resources/utils/sagaSlice';
import type { SagaIterator } from 'redux-saga';
import { take, put } from 'redux-saga/effects';
import { ApplicationSettingsActions } from 'src/shared/resources/applicationSettings/applicationSettingsSlice';
import { TextResourcesActions } from 'src/shared/resources/textResources/textResourcesSlice';
import { LanguageActions } from 'src/shared/resources/language/languageSlice';
import { ApplicationMetadataActions } from 'src/shared/resources/applicationMetadata/applicationMetadataSlice';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { OrgsActions } from 'src/shared/resources/orgs/orgsSlice';
import { FormDataActions } from 'src/features/form/data/formDataSlice';
import { DataModelActions } from 'src/features/form/datamodel/datamodelSlice';
import { AttachmentActions } from 'src/shared/resources/attachments/attachmentSlice';
import { ProfileActions } from 'src/shared/resources/profile/profileSlice';
import { profileApiUrl } from 'src/utils/appUrlHelper';
import { PartyActions } from 'src/shared/resources/party/partySlice';
import { IsLoadingActions } from 'src/shared/resources/isLoading/isLoadingSlice';
import { watchStartInitialInfoTaskQueueSaga } from 'src/shared/resources/queue/infoTask/infoTaskQueueSaga';

const commonState = { isDone: null, error: null };
export const initialState: IQueueState = {
  dataTask: { ...commonState },
  appTask: { ...commonState },
  userTask: { ...commonState },
  infoTask: { ...commonState },
  stateless: { ...commonState },
};

const queueSlice = createSagaSlice((mkAction: MkActionType<IQueueState>) => ({
  name: 'queue',
  initialState,
  actions: {
    appTaskQueueError: mkAction<IQueueError>({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.appTask.error = error;
      },
    }),
    userTaskQueueError: mkAction<IQueueError>({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.userTask.error = error;
      },
    }),
    dataTaskQueueError: mkAction<IQueueError>({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.dataTask.error = error;
      },
    }),
    infoTaskQueueError: mkAction<IQueueError>({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.infoTask.error = error;
      },
    }),
    statelessQueueError: mkAction<IQueueError>({
      reducer: (state, action) => {
        const { error } = action.payload;
        state.stateless.error = error;
      },
    }),
    startInitialAppTaskQueue: mkAction<void>({
      saga: (name) =>
        function* (): SagaIterator {
          yield take(name);
          yield put(ApplicationSettingsActions.fetchApplicationSettings());
          yield put(TextResourcesActions.fetch());
          yield put(LanguageActions.fetchLanguage());
          yield put(ApplicationMetadataActions.get());
          yield put(FormLayoutActions.fetchSets());
          yield put(OrgsActions.fetch());
          yield put(QueueActions.startInitialAppTaskQueueFulfilled());
        },
      reducer: (state) => {
        state.appTask.isDone = false;
      },
    }),
    startInitialAppTaskQueueFulfilled: mkAction<void>({
      reducer: (state) => {
        state.appTask.isDone = true;
      },
    }),
    startInitialUserTaskQueue: mkAction<void>({
      saga: (name) =>
        function* watchStartInitialUserTaskQueueSaga(): SagaIterator {
          yield take(name);
          yield put(ProfileActions.fetch({ url: profileApiUrl }));
          yield put(PartyActions.getCurrentParty());
          yield put(QueueActions.startInitialUserTaskQueueFulfilled());
        },
      reducer: (state) => {
        state.userTask.isDone = false;
      },
    }),
    startInitialUserTaskQueueFulfilled: mkAction<void>({
      reducer: (state) => {
        state.userTask.isDone = true;
      },
    }),
    startInitialDataTaskQueue: mkAction<void>({
      takeEvery: function* (): SagaIterator {
        yield put(FormDataActions.fetchInitial());
        yield put(DataModelActions.fetchJsonSchema());
        yield put(FormLayoutActions.fetchSets());
        yield put(FormLayoutActions.fetch());
        yield put(FormLayoutActions.fetchSettings());
        yield put(AttachmentActions.mapAttachments());
        yield put(QueueActions.startInitialDataTaskQueueFulfilled());
      },
      reducer: (state) => {
        state.dataTask.isDone = false;
      },
    }),
    startInitialDataTaskQueueFulfilled: mkAction<void>({
      reducer: (state) => {
        state.dataTask.isDone = true;
      },
    }),
    startInitialInfoTaskQueue: mkAction<void>({
      saga: () => watchStartInitialInfoTaskQueueSaga,
      reducer: (state) => {
        state.infoTask.isDone = false;
      },
    }),
    startInitialInfoTaskQueueFulfilled: mkAction<void>({
      reducer: (state) => {
        state.infoTask.isDone = true;
      },
    }),
    startInitialStatelessQueue: mkAction<void>({
      takeLatest: function* (): SagaIterator {
        yield put(IsLoadingActions.startStatelessIsLoading());
        yield put(FormDataActions.fetchInitial());
        yield put(DataModelActions.fetchJsonSchema());
        yield put(FormLayoutActions.fetchSets());
        yield put(FormLayoutActions.fetch());
        yield put(FormLayoutActions.fetchSettings());
        yield put(QueueActions.startInitialStatelessQueueFulfilled());
      },
      reducer: (state) => {
        state.stateless.isDone = false;
      },
    }),
    startInitialStatelessQueueFulfilled: mkAction<void>({
      reducer: (state) => {
        state.stateless.isDone = true;
      },
    }),
  },
}));

export const QueueActions = queueSlice.actions;
export default queueSlice;
