import type { AnyAction } from 'redux';

import { checkIfDataListShouldRefetchSaga } from 'src/features/dataLists/fetchDataListsSaga';
import { deleteAttachmentReferenceSaga } from 'src/features/formData/update/updateFormDataSagas';
import { checkIfOptionsShouldRefetchSaga } from 'src/features/options/fetch/fetchOptionsSagas';
import { ProcessActions } from 'src/features/process/processSlice';
import { createSagaSlice } from 'src/redux/sagaSlice';
import type { IDeleteAttachmentReference, IUpdateFormData } from 'src/features/formData/formDataTypes';
import type { IFormDataState } from 'src/features/formData/index';
import type { ActionsFromSlice, MkActionType } from 'src/redux/sagaSlice';

export const initialState: IFormDataState = {
  submittingId: '',
  error: null,
};

const isProcessAction = (action: AnyAction) =>
  action.type === ProcessActions.completeFulfilled.type || action.type === ProcessActions.completeRejected.type;

export let FormDataActions: ActionsFromSlice<typeof formDataSlice>;
export const formDataSlice = () => {
  const slice = createSagaSlice((mkAction: MkActionType<IFormDataState>) => ({
    name: 'formData',
    initialState,
    actions: {
      updateFulfilled: mkAction<IUpdateFormData>({
        takeEvery: [checkIfOptionsShouldRefetchSaga, checkIfDataListShouldRefetchSaga],
      }),
      deleteAttachmentReference: mkAction<IDeleteAttachmentReference>({
        takeLatest: deleteAttachmentReferenceSaga,
      }),
    },
    extraReducers: (builder) => {
      builder
        .addMatcher(isProcessAction, (state) => {
          state.submittingId = '';
        })
        .addDefaultCase((state) => state);
    },
  }));

  FormDataActions = slice.actions;
  return slice;
};
