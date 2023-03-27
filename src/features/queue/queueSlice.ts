import { put } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { ApplicationMetadataActions } from 'src/features/applicationMetadata/applicationMetadataSlice';
import { ApplicationSettingsActions } from 'src/features/applicationSettings/applicationSettingsSlice';
import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { FooterLayoutActions } from 'src/features/footer/data/footerLayoutSlice';
import { FormDataActions } from 'src/features/form/data/formDataSlice';
import { DataModelActions } from 'src/features/form/datamodel/datamodelSlice';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { IsLoadingActions } from 'src/features/isLoading/isLoadingSlice';
import { LanguageActions } from 'src/features/language/languageSlice';
import { OrgsActions } from 'src/features/orgs/orgsSlice';
import { PartyActions } from 'src/features/party/partySlice';
import { PdfActions } from 'src/features/pdf/data/pdfSlice';
import { ProfileActions } from 'src/features/profile/profileSlice';
import { watchStartInitialInfoTaskQueueSaga } from 'src/features/queue/infoTask/infoTaskQueueSaga';
import { TextResourcesActions } from 'src/features/textResources/textResourcesSlice';
import { createSagaSlice } from 'src/utils/sagaSlice';
import { profileApiUrl } from 'src/utils/urls/appUrlHelper';
import type { IQueueError, IQueueState } from 'src/features/queue/index';
import type { MkActionType } from 'src/utils/sagaSlice';

const commonState = { isDone: null, error: null };
export const initialState: IQueueState = {
  dataTask: { ...commonState },
  appTask: { ...commonState },
  userTask: { ...commonState },
  infoTask: { ...commonState },
  stateless: { ...commonState },
};

export const queueSlice = createSagaSlice((mkAction: MkActionType<IQueueState>) => ({
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
      *takeEvery(): SagaIterator {
        yield put(ApplicationSettingsActions.fetchApplicationSettings());
        yield put(TextResourcesActions.fetch());
        yield put(LanguageActions.fetchLanguage());
        yield put(ApplicationMetadataActions.get());
        yield put(FormLayoutActions.fetchSets());
        yield put(FooterLayoutActions.fetch());
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
      *takeEvery(): SagaIterator {
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
      *takeEvery(): SagaIterator {
        yield put(FormDataActions.fetchInitial());
        yield put(DataModelActions.fetchJsonSchema());
        yield put(FormLayoutActions.fetch());
        yield put(FormLayoutActions.fetchSettings());
        yield put(PdfActions.initial());
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
      *takeLatest(): SagaIterator {
        yield put(IsLoadingActions.startStatelessIsLoading());
        yield put(FormDataActions.fetchInitial());
        yield put(DataModelActions.fetchJsonSchema());
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
