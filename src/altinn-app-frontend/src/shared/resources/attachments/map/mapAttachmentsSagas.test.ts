import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import {
  mapAttachments,
  SelectInstance,
  SelectApplicationMetaData,
  SelectFormData,
  SelectFormLayouts, SelectAttachments
} from './mapAttachmentsSagas';
import { selectFormLayouts } from "src/features/form/layout/update/updateFormLayoutSagas";
import { getInitialStateMock } from "../../../../../__mocks__/mocks";
import AttachmentDispatcher from "src/shared/resources/attachments/attachmentActions";
import { IAttachments, IAttachment } from "src/shared/resources/attachments";
import { ILayoutComponent } from "src/features/form/layout";

describe('mapAttachments', () => {
  it('should map attachments to repeating group rows', () => {
    const state = getInitialStateMock();
    const basicUploader:ILayoutComponent = {
      id: 'upload-outside-group',
      type: 'FileUpload',
      dataModelBindings: {},
      textResourceBindings: {},
    };
    const basicUploaderWithBindings:ILayoutComponent = {
      id: 'upload-outside-group-with-bindings',
      type: 'FileUpload',
      dataModelBindings: {
        list: 'Outside.AttachmentsWithBindings',
      },
      textResourceBindings: {},
    };

    state.formLayout.layouts = {
      FormLayout: [
        basicUploader,
        basicUploaderWithBindings,
      ],
    };

    const defaultAttachmentProps = {
      tags: [],
      uploaded: true,
      size: 1234,
      updating: false,
      deleting: false,
    };
    const defaultDataTypeProps = {
      ...defaultAttachmentProps,
      blobStoragePath: 'test',
      locked: false,
      instanceGuid: 'test',
      contentType: 'image/jpeg',
      refs: [],
      created: new Date(),
      createdBy: 'user',
      lastChanged: new Date(),
      lastChangedBy: 'user',
    };

    const attachment1:IAttachment = {
      name: 'song1.mp3',
      id: 'attachment1',
      ...defaultAttachmentProps
    };
    const attachment2:IAttachment = {
      name: 'song2.mp3',
      id: 'attachment2',
      ...defaultAttachmentProps
    };
    const expected:IAttachments = {
      [basicUploader.id]: [attachment1],
      [basicUploaderWithBindings.id + '-0']: [attachment2],
    };

    state.formData.formData = {
      'Outside.AttachmentsWithBindings[0]': attachment2.id,
    };

    state.instanceData.instance.data.push({
      filename: attachment1.name,
      ...attachment1,
      ...defaultDataTypeProps,
      dataType: basicUploader.id,
    }, {
      filename: attachment2.name,
      ...attachment2,
      ...defaultDataTypeProps,
      dataType: basicUploaderWithBindings.id,
    });

    return expectSaga(mapAttachments)
      .provide([
        [select(SelectAttachments), SelectAttachments(state)],
        [select(SelectInstance), SelectInstance(state)],
        [select(SelectApplicationMetaData), SelectApplicationMetaData(state)],
        [select(SelectFormData), SelectFormData(state)],
        [select(SelectFormLayouts), selectFormLayouts(state)],
      ])
      .call(AttachmentDispatcher.mapAttachmentsFulfilled, expected)
      .run();
  });
});
