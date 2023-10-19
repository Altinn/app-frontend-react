/*
export function* deleteAttachmentSaga({
  payload: { attachment, attachmentType, componentId },
}: PayloadAction<IDeleteAttachmentAction>): SagaIterator {
  const langTools: IUseLanguage = yield select(staticUseLanguageFromState);
  const currentView: string = yield select((s: IRuntimeState) => s.formLayout.uiConfig.currentView);

  try {
    // Sets validations to empty.
    const newValidations = getFileUploadComponentValidations(null, langTools);
    yield put(
      ValidationActions.updateComponentValidations({
        componentId,
        pageKey: currentView,
        validationResult: { validations: newValidations },
      }),
    );

    const response: AxiosResponse = yield call(httpDelete, dataElementUrl(attachment.id));
    if (response.status === 200) {
      yield put(
        AttachmentActions.deleteAttachmentFulfilled({
          attachmentId: attachment.id,
          attachmentType,
          componentId,
        }),
      );
    } else {
      throw new Error(`Got error response when deleting attachment: ${response.status}`);
    }
  } catch (err) {
    const validations = getFileUploadComponentValidations('delete', langTools);
    yield put(
      ValidationActions.updateComponentValidations({
        componentId,
        pageKey: currentView,
        validationResult: { validations },
      }),
    );
    yield put(
      AttachmentActions.deleteAttachmentRejected({
        attachment,
        attachmentType,
        componentId,
      }),
    );
    window.logError('Delete attachment:\n', err);
  }
}
*/
