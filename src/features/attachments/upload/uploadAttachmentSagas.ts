import { AxiosError } from 'axios';
import { call, put, select } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { SagaIterator } from 'redux-saga';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { FormDataActions } from 'src/features/formData/formDataSlice';
import { ValidationActions } from 'src/features/validation/validationSlice';
import { Severity } from 'src/types';
import { getFileUploadComponentValidations } from 'src/utils/formComponentUtils';
import { httpPost } from 'src/utils/network/networking';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import { fileUploadUrl } from 'src/utils/urls/appUrlHelper';
import { customEncodeURI } from 'src/utils/urls/urlHelper';
import type { IAttachment } from 'src/features/attachments';
import type { IUploadAttachmentAction } from 'src/features/attachments/upload/uploadAttachmentActions';
import type { IComponentValidations, IRuntimeState, IValidationIssue } from 'src/types';
import type { ILanguage } from 'src/types/shared';

export function* uploadAttachmentSaga({
  payload: { file, attachmentType, tmpAttachmentId, componentId, dataModelBindings, index },
}: PayloadAction<IUploadAttachmentAction>): SagaIterator {
  const currentView: string = yield select((s: IRuntimeState) => s.formLayout.uiConfig.currentView);
  const language: ILanguage = yield select((s: IRuntimeState) => s.language.language);
  const textResources = yield select((s: IRuntimeState) => s.textResources.resources);
  const backendFeatures = yield select((s: IRuntimeState) => s.applicationMetadata.applicationMetadata?.features);

  try {
    // Sets validations to empty.
    const newValidations = getFileUploadComponentValidations(null, {});
    yield put(
      ValidationActions.updateComponentValidations({
        componentId,
        layoutId: currentView,
        validations: newValidations,
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

    if (response.status === 201) {
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

      if (dataModelBindings && (dataModelBindings.simpleBinding || dataModelBindings.list)) {
        yield put(
          FormDataActions.update({
            componentId,
            data: response.data.id,
            field: dataModelBindings.simpleBinding
              ? `${dataModelBindings.simpleBinding}`
              : `${dataModelBindings.list}[${index}]`,
          }),
        );
      }
    } else {
      throw new AxiosError('Error uploading file', undefined, undefined, undefined, response);
    }
  } catch (err) {
    if (err instanceof AxiosError) {
      let validations: IComponentValidations = {};

      if (backendFeatures?.jsonObjectInDataResponse && err.response?.data?.result) {
        const validationIssues: IValidationIssue[] = err.response.data.result;

        validations = {
          simpleBinding: {
            errors: validationIssues
              .filter((v) => v.severity === Severity.Error)
              .map((v) => getTextFromAppOrDefault(v.code, textResources, language, undefined, true)),
            warnings: validationIssues
              .filter((v) => v.severity === Severity.Warning)
              .map((v) => getTextFromAppOrDefault(v.code, textResources, language, undefined, true)),
          },
        };
      } else {
        validations = getFileUploadComponentValidations('upload', language);
      }

      yield put(
        ValidationActions.updateComponentValidations({
          componentId,
          layoutId: currentView,
          validations,
        }),
      );
      yield put(
        AttachmentActions.uploadAttachmentRejected({
          componentId,
          attachmentType,
          attachmentId: tmpAttachmentId,
        }),
      );
    } else {
      // Ukjent feil?
      console.error('File upload failed for an unknown reason');
    }
  }
}
