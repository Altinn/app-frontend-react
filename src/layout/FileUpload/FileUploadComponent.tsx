import React from 'react';
import { toast } from 'react-toastify';
import type { FileRejection } from 'react-dropzone';

import { useAttachmentsFor, useAttachmentsUploader } from 'src/features/attachments/hooks';
import {
  AttachmentsMappedToFormDataProvider,
  useAttachmentsMappedToFormData,
} from 'src/features/attachments/useAttachmentsMappedToFormData';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { hasValidationErrors } from 'src/features/validation/utils';
import { useIsMobileOrTablet } from 'src/hooks/useIsMobile';
import { AttachmentsCounter } from 'src/layout/FileUpload/AttachmentsCounter';
import { DropzoneComponent } from 'src/layout/FileUpload/DropZone/DropzoneComponent';
import classes from 'src/layout/FileUpload/FileUploadComponent.module.css';
import { FileTable } from 'src/layout/FileUpload/FileUploadTable/FileTable';
import { handleRejectedFiles } from 'src/layout/FileUpload/handleRejectedFiles';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export type IFileUploadWithTagProps = PropsFromGenericComponent<'FileUpload' | 'FileUploadWithTag'>;

export function FileUploadComponent({ node }: IFileUploadWithTagProps): React.JSX.Element {
  const item = useNodeItem(node);
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
  } = item;
  const [showFileUpload, setShowFileUpload] = React.useState(false);
  const mobileView = useIsMobileOrTablet();
  const attachments = useAttachmentsFor(node);
  const uploadAttachment = useAttachmentsUploader();
  const mappingTools = useAttachmentsMappedToFormData(node);

  const validations = useUnifiedValidationsForNode(node).filter((v) => !('attachmentId' in v) || !v.attachmentId);
  const langTools = useLanguage();

  const { options, isFetching } = useGetOptions(node as LayoutNode<'FileUploadWithTag'>, 'single');

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
        <Lang id={'form_filler.file_uploader_add_attachment'} />
      </button>
    );
  };

  const handleDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    const totalAttachments = acceptedFiles.length + rejectedFiles.length + attachments.length;

    if (totalAttachments > maxNumberOfAttachments) {
      // if the user adds more attachments than max, all should be ignored
      toast(
        <Lang
          id={'form_filler.file_uploader_validation_error_exceeds_max_files'}
          params={[maxNumberOfAttachments]}
        />,
        { type: 'error' },
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
      toast(<Lang id={`- ${rejections.join('\n- ')}`} />, { type: 'error' });
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
              hasValidationMessages={hasValidationErrors(validations)}
              hasCustomFileEndings={hasCustomFileEndings}
              validFileEndings={validFileEndings}
              textResourceBindings={textResourceBindings}
            />
            {attachmentsCounter}
            <ComponentValidations validations={validations} />
          </>
        )}

        <FileTable
          node={node}
          mobileView={mobileView}
          attachments={attachments}
          options={options}
          isFetching={isFetching}
        />

        {!shouldShowFileUpload && (
          <>
            {attachmentsCounter}
            <ComponentValidations validations={validations} />
          </>
        )}
        {renderAddMoreAttachmentsButton()}
      </div>
    </AttachmentsMappedToFormDataProvider>
  );
}
