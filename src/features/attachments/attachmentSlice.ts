import { deleteAttachmentSaga } from 'src/features/attachments/delete/deleteAttachmentSagas';
import { updateAttachmentSaga } from 'src/features/attachments/update/updateAttachmentSagas';
import { uploadAttachmentSaga } from 'src/features/attachments/upload/uploadAttachmentSagas';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';

interface IAttachmentState {}
const initialState: IAttachmentState = {};

export let AttachmentActions: ActionsFromSlice<typeof attachmentSlice>;
export const attachmentSlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<IAttachmentState>) => ({
    name: 'attachments',
    initialState,
    actions: {
      uploadAttachment: mkAction<any>({
        takeEvery: uploadAttachmentSaga,
        // reducer: (state, action) => {
        //   const { file, componentId, tmpAttachmentId } = action.payload;
        //   if (!state.attachments[componentId]) {
        //     state.attachments[componentId] = [];
        //   }
        //
        //   state.attachments[componentId].push({
        //     name: file.name,
        //     size: file.size,
        //     uploaded: false,
        //     id: tmpAttachmentId,
        //     tags: [],
        //     deleting: false,
        //     updating: false,
        //   });
        // },
      }),
      uploadAttachmentFulfilled: mkAction<any>({
        // reducer: (state, action) => {
        //   const { attachment, componentId, tmpAttachmentId } = action.payload;
        //   const index = state.attachments[componentId].findIndex((item) => item.id === tmpAttachmentId);
        //   if (index < 0) {
        //     return;
        //   }
        //
        //   state.attachments[componentId][index] = attachment;
        // },
      }),
      uploadAttachmentRejected: mkAction<any>({
        // reducer: (state, action) => {
        //   const { componentId, attachmentId } = action.payload;
        //   state.attachments[componentId] = state.attachments[componentId].filter(
        //     (attachment) => attachment.id !== attachmentId,
        //   );
        // },
      }),
      updateAttachment: mkAction<any>({
        takeEvery: updateAttachmentSaga,
        // reducer: (state, action) => {
        //   const { attachment, componentId } = action.payload;
        //   if (!state.attachments[componentId]) {
        //     state.attachments[componentId] = [];
        //   }
        //   const newAttachment = { ...attachment, updating: true };
        //   const index = state.attachments[componentId].findIndex((item) => item.id === attachment.id);
        //
        //   state.attachments[componentId][index] = newAttachment;
        // },
      }),
      updateAttachmentFulfilled: mkAction<any>({
        // reducer: (state, action) => {
        //   const { attachment, componentId } = action.payload;
        //   const newAttachment = { ...attachment, updating: false };
        //   const index = state.attachments[componentId].findIndex((item) => item.id === attachment.id);
        //   state.attachments[componentId][index] = newAttachment;
        // },
      }),
      updateAttachmentRejected: mkAction<any>({
        // reducer: (state, action) => {
        //   const { attachment, componentId, tag } = action.payload;
        //   const newAttachment = {
        //     ...attachment,
        //     tag,
        //     updating: false,
        //   };
        //   const index = state.attachments[componentId].findIndex((item) => item.id === attachment.id);
        //
        //   state.attachments[componentId][index] = newAttachment;
        // },
      }),
      deleteAttachment: mkAction<any>({
        takeEvery: deleteAttachmentSaga,
        // reducer: (state, action) => {
        //   const { attachment, componentId } = action.payload;
        //   const index = state.attachments[componentId].findIndex((element) => element.id === attachment.id);
        //   if (index < 0) {
        //     return;
        //   }
        //   state.attachments[componentId][index].deleting = true;
        // },
      }),
      deleteAttachmentFulfilled: mkAction<any>({
        // reducer: (state, action) => {
        //   const { attachmentId: id, componentId } = action.payload;
        //   state.attachments[componentId] = state.attachments[componentId].filter((attachment) => attachment.id !== id);
        // },
      }),
      deleteAttachmentRejected: mkAction<any>({
        // reducer: (state, action) => {
        //   const { attachment, componentId } = action.payload;
        //   const newAttachment = { ...attachment, deleting: false };
        //   const index = state.attachments[componentId].findIndex((element) => element.id === attachment.id);
        //   if (index < 0) {
        //     return;
        //   }
        //   state.attachments[componentId][index] = newAttachment;
        // },
      }),
    },
  }));

  AttachmentActions = slice.actions;
  return slice;
};
