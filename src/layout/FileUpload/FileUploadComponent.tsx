import React from 'react';
import type { FileRejection } from 'react-dropzone';

import { v4 as uuidv4 } from 'uuid';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { hasValidationErrors } from 'src/features/validation';
import { useAlertPopper } from 'src/hooks/useAlertPopper';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useIsMobileOrTablet } from 'src/hooks/useIsMobile';
import { useLanguage } from 'src/hooks/useLanguage';
import { AttachmentsCounter } from 'src/layout/FileUpload/AttachmentsCounter';
import { DropzoneComponent } from 'src/layout/FileUpload/DropZone/DropzoneComponent';
import classes from 'src/layout/FileUpload/FileUploadComponent.module.css';
import { FileTableComponent } from 'src/layout/FileUpload/FileUploadTable/FileTableComponent';
import { handleRejectedFiles } from 'src/layout/FileUpload/handleRejectedFiles';
import { ComponentValidation } from 'src/utils/render';
import type { IAttachment } from 'src/features/attachments';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IRuntimeState } from 'src/types';

export type IFileUploadWithTagProps = PropsFromGenericComponent<'FileUpload' | 'FileUploadWithTag'>;

export function FileUploadComponent({ validations, node }: IFileUploadWithTagProps): React.JSX.Element {
  const {
    id,
    baseComponentId,
    maxFileSizeInMB,
    readOnly,
    displayMode,
    maxNumberOfAttachments,
    minNumberOfAttachments,
    hasCustomFileEndings,
    validFileEndings,
    textResourceBindings,
    dataModelBindings,
  } = node.item;

  const dataDispatch = useAppDispatch();
  const [showFileUpload, setShowFileUpload] = React.useState(false);
  const mobileView = useIsMobileOrTablet();
  const attachments: IAttachment[] = useAppSelector((state: IRuntimeState) => state.attachments.attachments[id] || []);

  const componentValidations = validations?.filter((v) => !v.metadata?.attachmentId);
  const attachmentValidations = validations?.filter((v) => v.metadata?.attachmentId);

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
    (displayMode !== 'simple' || attachments.length === 0 || showFileUpload === true);

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
    const fileType = baseComponentId || id;
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
    acceptedFiles.forEach((file: File, index) => {
      dataDispatch(
        AttachmentActions.uploadAttachment({
          file,
          attachmentType: fileType,
          tmpAttachmentId: uuidv4(),
          componentId: id,
          dataModelBindings,
          index: attachments.length + index,
        }),
      );
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

      <FileTableComponent
        node={node}
        mobileView={mobileView}
        attachments={attachments}
        attachmentValidations={attachmentValidations}
        options={options}
        showPopper={showPopper}
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
  );
}
