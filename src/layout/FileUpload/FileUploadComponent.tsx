import React from 'react';
import type { FileRejection } from 'react-dropzone';

import { v4 as uuidv4 } from 'uuid';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useIsMobileOrTablet } from 'src/hooks/useIsMobile';
import { useLanguage } from 'src/hooks/useLanguage';
import classes from 'src/layout/FileUpload/FileUploadComponent.module.css';
import { FileUploadTable } from 'src/layout/FileUpload/FileUploadTable';
import { DropzoneComponent } from 'src/layout/FileUpload/shared/DropzoneComponent';
import { handleRejectedFiles } from 'src/layout/FileUpload/shared/handleRejectedFiles';
import { AttachmentsCounter } from 'src/layout/FileUpload/shared/render';
import { renderValidationMessagesForComponent } from 'src/utils/render';
import type { IAttachment } from 'src/features/attachments';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IRuntimeState } from 'src/types';
import type { IComponentValidations } from 'src/utils/validation/types';

export type IFileUploadProps = PropsFromGenericComponent<'FileUpload'>;

export const emptyArray = [];

export function FileUploadComponent({ node, componentValidations }: IFileUploadProps) {
  const {
    id,
    baseComponentId,
    readOnly,
    maxNumberOfAttachments,
    maxFileSizeInMB,
    minNumberOfAttachments,
    validFileEndings,
    displayMode,
    hasCustomFileEndings,
    textResourceBindings,
    dataModelBindings,
  } = node.item;
  const dispatch = useAppDispatch();
  const [validations, setValidations] = React.useState<string[]>([]);
  const [showFileUpload, setShowFileUpload] = React.useState(false);
  const mobileView = useIsMobileOrTablet();
  const attachments: IAttachment[] = useAppSelector((state: IRuntimeState) => state.attachments.attachments[id] || []);
  const langTools = useLanguage();
  const { lang, langAsString } = langTools;

  const getComponentValidations = (): IComponentValidations => {
    const validationMessages = {
      simpleBinding: {
        errors: [...(componentValidations?.simpleBinding?.errors ?? [])],
        warnings: [...(componentValidations?.simpleBinding?.warnings ?? [])],
        fixed: [...(componentValidations?.simpleBinding?.fixed ?? [])],
      },
    };

    validationMessages.simpleBinding.errors.push(...validations);
    return validationMessages;
  };

  const handleDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    const fileType = baseComponentId || id;
    const totalAttachments = acceptedFiles.length + rejectedFiles.length + attachments.length;

    if (totalAttachments > maxNumberOfAttachments) {
      // if the user adds more attachments than max, all should be ignored
      setValidations([
        `${langAsString(
          'form_filler.file_uploader_validation_error_exceeds_max_files_1',
        )} ${maxNumberOfAttachments} ${langAsString('form_filler.file_uploader_validation_error_exceeds_max_files_2')}`,
      ]);
    } else {
      // we should upload all files, if any rejected files we should display an error
      acceptedFiles.forEach((file: File, index) => {
        dispatch(
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
      setValidations(rejections);
    }
  };

  const shouldShowFileUpload = (): boolean => {
    if (attachments.length >= maxNumberOfAttachments) {
      return false;
    }
    return displayMode !== 'simple' || attachments.length === 0 || showFileUpload === true;
  };

  const renderAddMoreAttachmentsButton = (): JSX.Element | null => {
    if (
      displayMode === 'simple' &&
      !showFileUpload &&
      attachments.length < maxNumberOfAttachments &&
      attachments.length > 0
    ) {
      return (
        <button
          className={`${classes.fileUploadButton} ${classes.blueUnderline}`}
          onClick={() => setShowFileUpload(true)}
          type='button'
        >
          {lang('form_filler.file_uploader_add_attachment')}
        </button>
      );
    }
    return null;
  };

  const validationMessages = getComponentValidations();
  const hasValidationMessages =
    validationMessages.simpleBinding?.errors && validationMessages.simpleBinding.errors.length > 0;

  const renderValidationMessages =
    hasValidationMessages &&
    !showFileUpload &&
    renderValidationMessagesForComponent(validationMessages.simpleBinding, id);

  return (
    <div
      id={`altinn-fileuploader-${id}`}
      style={{ padding: '0px' }}
    >
      {shouldShowFileUpload() && (
        <DropzoneComponent
          id={id}
          isMobile={mobileView}
          maxFileSizeInMB={maxFileSizeInMB}
          readOnly={!!readOnly}
          onClick={(e) => e.preventDefault()}
          onDrop={handleDrop}
          hasValidationMessages={!!hasValidationMessages}
          hasCustomFileEndings={hasCustomFileEndings}
          validFileEndings={validFileEndings}
          textResourceBindings={textResourceBindings}
        />
      )}
      {shouldShowFileUpload() && (
        <AttachmentsCounter
          currentNumberOfAttachments={attachments.length}
          minNumberOfAttachments={minNumberOfAttachments}
          maxNumberOfAttachments={maxNumberOfAttachments}
        />
      )}
      {renderValidationMessages}
      <FileUploadTable
        attachments={attachments}
        mobileView={mobileView}
        node={node}
      />
      {!shouldShowFileUpload() && (
        <AttachmentsCounter
          currentNumberOfAttachments={attachments.length}
          minNumberOfAttachments={minNumberOfAttachments}
          maxNumberOfAttachments={maxNumberOfAttachments}
        />
      )}
      {renderAddMoreAttachmentsButton()}
    </div>
  );
}
