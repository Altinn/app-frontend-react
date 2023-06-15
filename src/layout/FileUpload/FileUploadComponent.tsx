import React from 'react';
import type { FileRejection } from 'react-dropzone';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import { v4 as uuidv4 } from 'uuid';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import classes from 'src/layout/FileUpload/FileUploadComponent.module.css';
import { FileUploadTableRow } from 'src/layout/FileUpload/FileUploadTableRow';
import { DropzoneComponent } from 'src/layout/FileUpload/shared/DropzoneComponent';
import { handleRejectedFiles } from 'src/layout/FileUpload/shared/handleRejectedFiles';
import { AttachmentsCounter } from 'src/layout/FileUpload/shared/render';
import { renderValidationMessagesForComponent } from 'src/utils/render';
import type { IAttachment } from 'src/features/attachments';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IComponentValidations } from 'src/types';

export type IFileUploadProps = PropsFromGenericComponent<'FileUpload'>;

export const emptyArray = [];

export function FileUploadComponent({ node, componentValidations, language }: IFileUploadProps) {
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
  const mobileView = useMediaQuery('(max-width:992px)'); // breakpoint on altinn-modal
  const attachments = useAppSelector((state) => state.attachments.attachments[id] || emptyArray);
  const { lang, langAsString } = useLanguage();
  const alertOnDelete = node.item?.alertOnDelete;
  const getComponentValidations = (): IComponentValidations => {
    const validationMessages = {
      simpleBinding: {
        errors: [...(componentValidations?.simpleBinding?.errors || [])],
        warnings: [...(componentValidations?.simpleBinding?.warnings || [])],
        fixed: [...(componentValidations?.simpleBinding?.fixed || [])],
      },
    };
    if (!validations || validations.length === 0) {
      return validationMessages;
    }
    validations.forEach((message) => {
      validationMessages.simpleBinding.errors.push(message);
    });
    return validationMessages;
  };

  const handleDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    const newFiles: IAttachment[] = [];
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
        if (attachments.length + newFiles.length < maxNumberOfAttachments) {
          const tmpId: string = uuidv4();
          newFiles.push({
            name: file.name,
            size: file.size,
            uploaded: false,
            id: tmpId,
            tags: undefined,
            deleting: false,
            updating: false,
          });
          dispatch(
            AttachmentActions.uploadAttachment({
              file,
              attachmentType: fileType,
              tmpAttachmentId: tmpId,
              componentId: id,
              dataModelBindings,
              index: attachments.length + index,
            }),
          );
        }
      });

      if (acceptedFiles.length > 0) {
        setShowFileUpload(displayMode === 'simple' ? false : attachments.length < maxNumberOfAttachments);
      }
      const rejections = handleRejectedFiles({
        language,
        rejectedFiles,
        maxFileSizeInMB,
      });
      setValidations(rejections);
    }
  };

  const NonMobileColumnHeader = () =>
    !mobileView ? <th scope='col'>{lang('form_filler.file_uploader_list_header_file_size')}</th> : null;

  const FileList = (): JSX.Element | null => {
    if (!attachments?.length) {
      return null;
    }
    return (
      <div
        id={`altinn-file-list${id}`}
        data-testid={id}
      >
        <table
          className={classes.fileUploadTable}
          data-testid='file-upload-table'
        >
          <thead>
            <tr
              className={classes.blueUnderline}
              id='altinn-file-list-row-header'
            >
              <th
                scope='col'
                style={!mobileView ? { width: '30%' } : {}}
              >
                {lang('form_filler.file_uploader_list_header_name')}
              </th>
              <NonMobileColumnHeader />
              <th
                scope='col'
                style={mobileView ? { textAlign: 'center' } : {}}
              >
                {lang('form_filler.file_uploader_list_header_status')}
              </th>
              <th
                scope='col'
                style={!mobileView ? { width: '30%' } : {}}
              >
                <p className='sr-only'>{lang('form_filler.file_uploader_list_header_delete_sr')}</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {attachments.map((attachment, index: number) => (
              <FileUploadTableRow
                key={attachment.id}
                id={id}
                alertOnDelete={alertOnDelete}
                attachment={attachment}
                index={index}
                mobileView={mobileView}
                baseComponentId={baseComponentId}
                dataModelBindings={dataModelBindings}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const updateShowFileUpload = () => {
    setShowFileUpload(true);
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
          onClick={updateShowFileUpload}
          type='button'
        >
          {lang('form_filler.file_uploader_add_attachment')}
        </button>
      );
    }
    return null;
  };

  const handleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault();
  };

  const validationMessages = getComponentValidations();
  const hasValidationMessages =
    validationMessages.simpleBinding?.errors && validationMessages.simpleBinding.errors.length > 0;

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
          onClick={handleClick}
          onDrop={handleDrop}
          hasValidationMessages={!!hasValidationMessages}
          hasCustomFileEndings={hasCustomFileEndings}
          validFileEndings={validFileEndings}
          textResourceBindings={textResourceBindings}
        />
      )}

      {shouldShowFileUpload() &&
        AttachmentsCounter({
          language,
          currentNumberOfAttachments: attachments.length,
          minNumberOfAttachments,
          maxNumberOfAttachments,
        })}

      {validationMessages.simpleBinding?.errors &&
        validationMessages.simpleBinding.errors.length > 0 &&
        showFileUpload &&
        renderValidationMessagesForComponent(validationMessages.simpleBinding, id)}
      <FileList />
      {!shouldShowFileUpload() &&
        AttachmentsCounter({
          language,
          currentNumberOfAttachments: attachments.length,
          minNumberOfAttachments,
          maxNumberOfAttachments,
        })}

      {validationMessages.simpleBinding?.errors &&
        validationMessages.simpleBinding.errors.length > 0 &&
        !showFileUpload &&
        renderValidationMessagesForComponent(validationMessages.simpleBinding, id)}

      {renderAddMoreAttachmentsButton()}
    </div>
  );
}
