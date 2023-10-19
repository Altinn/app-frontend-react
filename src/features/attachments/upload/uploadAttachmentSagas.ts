/*
export function* uploadAttachmentSaga({
  payload: { file, attachmentType, tmpAttachmentId, componentId, dataModelBindings, index },
}: PayloadAction<IUploadAttachmentAction>): SagaIterator {
  const currentView: string = yield select((s: IRuntimeState) => s.formLayout.uiConfig.currentView);
  const backendFeatures = yield select((s: IRuntimeState) => s.applicationMetadata.applicationMetadata?.features);
  const langTools: IUseLanguage = yield select(staticUseLanguageFromState);

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

    const fileUploadLink = fileUploadUrl(attachmentType);
    let contentType: string;

    if (!file.type) {
      contentType = `application/octet-stream`;
    } else if (file.name.toLowerCase().endsWith('.csv')) {
      contentType = 'text/csv';
    } else {
      contentType = file.type;
    }

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=${customEncodeURI(file.name)}`,
      },
    };

    const response: AxiosResponse = yield call(httpPost, fileUploadLink, config, file);

    const attachment: IAttachment = {
      name: file.name,
      size: file.size,
      uploaded: true,
      tags: [],
      id: response.data.id,
      deleting: false,
      updating: false,
    };
    yield put(
      AttachmentActions.uploadAttachmentFulfilled({
        attachment,
        attachmentType,
        tmpAttachmentId,
        componentId,
      }),
    );

    if (dataModelBindings && ('simpleBinding' in dataModelBindings || 'list' in dataModelBindings)) {
      yield put(
        FormDataActions.update({
          componentId,
          data: response.data.id,
          field:
            'simpleBinding' in dataModelBindings
              ? `${dataModelBindings.simpleBinding}`
              : `${dataModelBindings.list}[${index}]`,
        }),
      );
    }
  } catch (err) {
    let validations: IComponentValidations;

    if (backendFeatures?.jsonObjectInDataResponse && isAxiosError(err) && err.response?.data) {
      const validationIssues: BackendValidationIssue[] = err.response.data;

      validations = {
        simpleBinding: {
          errors: validationIssues
            .filter((v) => v.severity === BackendValidationSeverity.Error)
            .map((v) => getValidationMessage(v, langTools)),
          warnings: validationIssues
            .filter((v) => v.severity === BackendValidationSeverity.Warning)
            .map((v) => getValidationMessage(v, langTools)),
        },
      };
    } else {
      validations = getFileUploadComponentValidations('upload', langTools);
    }

    yield put(
      ValidationActions.updateComponentValidations({
        componentId,
        pageKey: currentView,
        validationResult: { validations },
      }),
    );
    yield put(
      AttachmentActions.uploadAttachmentRejected({
        componentId,
        attachmentType,
        attachmentId: tmpAttachmentId,
      }),
    );
  }
}
*/
