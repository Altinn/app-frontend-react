/*
export function* updateAttachmentSaga({
  payload: { attachment, componentId, baseComponentId, tag },
}: PayloadAction<any>): SagaIterator {
  const state: IRuntimeState = yield select();
  const langTools: IUseLanguage = yield select(staticUseLanguageFromState);
  const currentView = state.formLayout.uiConfig.currentView;

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

    const fileUpdateLink = fileTagUrl(attachment.id);

    if (attachment.tags !== undefined && attachment.tags.length > 0 && tag !== attachment.tags[0]) {
      const deleteResponse: any = yield call(httpDelete, `${fileUpdateLink}/${attachment.tags[0]}`);
      if (deleteResponse.status !== 204) {
        const validations = getFileUploadComponentValidations('update', langTools, attachment.id);
        yield put(
          ValidationActions.updateComponentValidations({
            componentId,
            pageKey: currentView,
            validationResult: { validations },
          }),
        );
        yield put(
          AttachmentActions.updateAttachmentRejected({
            attachment,
            componentId,
            baseComponentId,
            tag: attachment.tags[0],
          }),
        );
        return;
      }
    }

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response: any = yield call(httpPost, fileUpdateLink, config, `"${tag}"`);

    if (response.status === 201) {
      const newAttachment: IAttachment = {
        ...attachment,
        tags: response.data.tags,
      };
      yield put(
        AttachmentActions.updateAttachmentFulfilled({
          attachment: newAttachment,
          componentId,
          baseComponentId,
        }),
      );
    } else {
      const validations = getFileUploadComponentValidations('update', langTools, attachment.id);
      yield put(
        ValidationActions.updateComponentValidations({
          componentId,
          pageKey: currentView,
          validationResult: { validations },
        }),
      );
      yield put(
        AttachmentActions.updateAttachmentRejected({
          attachment,
          componentId,
          baseComponentId,
          tag: undefined,
        }),
      );
    }
  } catch (err) {
    const validations = getFileUploadComponentValidations('update', langTools, attachment.id);
    yield put(
      ValidationActions.updateComponentValidations({
        componentId,
        pageKey: currentView,
        validationResult: { validations },
      }),
    );
    yield put(
      AttachmentActions.updateAttachmentRejected({
        attachment,
        componentId,
        baseComponentId,
        tag: undefined,
      }),
    );
  }
}
*/
