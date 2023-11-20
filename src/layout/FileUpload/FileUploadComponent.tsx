import React from 'react';
import type { FileRejection } from 'react-dropzone';

import { useAttachmentsFor, useAttachmentsUploader } from 'src/features/attachments/AttachmentsContext';
import {
  AttachmentsMappedToFormDataProvider,
  useAttachmentsMappedToFormData,
} from 'src/features/attachments/useAttachmentsMappedToFormData';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { hasValidationErrors } from 'src/features/validation/utils';
import { useAlertPopper } from 'src/hooks/useAlertPopper';
import { useIsMobileOrTablet } from 'src/hooks/useIsMobile';
import { useLanguage } from 'src/hooks/useLanguage';
import { AttachmentsCounter } from 'src/layout/FileUpload/AttachmentsCounter';
import { DropzoneComponent } from 'src/layout/FileUpload/DropZone/DropzoneComponent';
import classes from 'src/layout/FileUpload/FileUploadComponent.module.css';
import { FileTable } from 'src/layout/FileUpload/FileUploadTable/FileTable';
import { handleRejectedFiles } from 'src/layout/FileUpload/handleRejectedFiles';
import { ComponentValidation } from 'src/utils/render';
import type { PropsFromGenericComponent } from 'src/layout';

export type IFileUploadWithTagProps = PropsFromGenericComponent<'FileUpload' | 'FileUploadWithTag'>;

export function FileUploadComponent({
  validations,
  node,
  handleDataChange,
}: IFileUploadWithTagProps): React.JSX.Element {
  const {
    id,
    maxFileSizeInMB,
    readOnly,
    displayMode,
    maxNumberOfAttachments,
    minNumberOfAttachments,
    hasCustomFileEndings,
    validFileEndings,
    textResourceBindings,
  } = node.item;
  const [showFileUpload, setShowFileUpload] = React.useState(false);
  const mobileView = useIsMobileOrTablet();
  const attachments = useAttachmentsFor(node);
  const uploadAttachment = useAttachmentsUploader();
  const mappingTools = useAttachmentsMappedToFormData({
    handleDataChange,
    node,
  });

  const componentValidations = validations?.filter((v) => !v.meta?.attachmentId);
  const attachmentValidations = validations?.filter((v) => v.meta?.attachmentId);

  const langTools = useLanguage();
  const { lang, langAsString } = langTools;

  const [Popper, showPopper] = useAlertPopper();

  const { options } = useGetOptions({
    ...node.item,
    node,
    formData: {
      disable: 'I have read the code and know that core functionality will be missing',
    },
  });

  const shouldShowFileUpload =
    !(attachments.length >= maxNumberOfAttachments) &&
    (displayMode !== 'simple' || attachments.length === 0 || showFileUpload);

  const renderAddMoreAttachmentsButton = (): JSX.Element | null => {
    const canShowButton =
      displayMode === 'simple' &&
      !showFileUpload &&
      attachments.length < maxNumberOfAttachments &&
      attachments.length > 0;

    if (!canShowButton) {
      return null;
    }
    return (
      <button
        className={`${classes.fileUploadButton} ${classes.blueUnderline}`}
        onClick={() => setShowFileUpload(true)}
      >
        {lang('form_filler.file_uploader_add_attachment')}
      </button>
    );
  };

  const handleDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    const totalAttachments = acceptedFiles.length + rejectedFiles.length + attachments.length;

    if (totalAttachments > maxNumberOfAttachments) {
      // if the user adds more attachments than max, all should be ignored
      showPopper(
        langAsString('form_filler.file_uploader_validation_error_exceeds_max_files', [maxNumberOfAttachments]),
        'danger',
      );
      return;
    }
    // we should upload all files, if any rejected files we should display an error
    acceptedFiles.forEach((file: File) => {
      uploadAttachment({ file, node }).then((id) => {
        id && mappingTools.addAttachment(id);
      });
    });

    if (acceptedFiles.length > 0) {
      setShowFileUpload(displayMode === 'simple' ? false : attachments.length < maxNumberOfAttachments);
    }
    const rejections = handleRejectedFiles({
      langTools,
      rejectedFiles,
      maxFileSizeInMB,
    });
    if (rejections?.length) {
      const errorMessage = `- ${rejections.join('\n- ')}`;
      showPopper(errorMessage, 'danger');
    }
  };

  const attachmentsCounter = (
    <AttachmentsCounter
      currentNumberOfAttachments={attachments.length}
      minNumberOfAttachments={minNumberOfAttachments}
      maxNumberOfAttachments={maxNumberOfAttachments}
    />
  );

  return (
    <AttachmentsMappedToFormDataProvider mappingTools={mappingTools}>
      <div
        id={`altinn-fileuploader-${id}`}
        style={{ padding: '0px' }}
      >
        {shouldShowFileUpload && (
          <>
            <DropzoneComponent
              id={id}
              isMobile={mobileView}
              maxFileSizeInMB={maxFileSizeInMB}
              readOnly={!!readOnly}
              onClick={(e) => e.preventDefault()}
              onDrop={handleDrop}
              hasValidationMessages={hasValidationErrors(componentValidations)}
              hasCustomFileEndings={hasCustomFileEndings}
              validFileEndings={validFileEndings}
              textResourceBindings={textResourceBindings}
            />
            {attachmentsCounter}
            <ComponentValidation validations={componentValidations} />
          </>
        )}

        <FileTable
          node={node}
          mobileView={mobileView}
          attachments={attachments}
          attachmentValidations={attachmentValidations}
          options={options}
        />

        {!shouldShowFileUpload && (
          <>
            {attachmentsCounter}
            <ComponentValidation validations={componentValidations} />
          </>
        )}
        {renderAddMoreAttachmentsButton()}
        <Popper />
      </div>
    </AttachmentsMappedToFormDataProvider>
  );
}
