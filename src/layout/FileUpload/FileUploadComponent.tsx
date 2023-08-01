import React from 'react';
import type { FileRejection } from 'react-dropzone';

import { v4 as uuidv4 } from 'uuid';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useIsMobileOrTablet } from 'src/hooks/useIsMobile';
import { useLanguage } from 'src/hooks/useLanguage';
import { AttachmentsCounter } from 'src/layout/FileUpload/AttachmentsCounter';
import { DropzoneComponent } from 'src/layout/FileUpload/DropZone/DropzoneComponent';
import classes from 'src/layout/FileUpload/FileUploadComponent.module.css';
import { FileTableComponent } from 'src/layout/FileUpload/FileUploadTable/FileTableComponent';
import { handleRejectedFiles } from 'src/layout/FileUpload/handleRejectedFiles';
import {
  getFileUploadWithTagComponentValidations,
  isAttachmentError,
  isNotAttachmentError,
  parseFileUploadComponentWithTagValidationObject,
} from 'src/utils/formComponentUtils';
import { getOptionLookupKey } from 'src/utils/options';
import { renderValidationMessagesForComponent } from 'src/utils/render';
import type { IAttachment } from 'src/features/attachments';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IRuntimeState } from 'src/types';
import type { IComponentValidations } from 'src/utils/validation/types';

export type IFileUploadWithTagProps = PropsFromGenericComponent<'FileUpload' | 'FileUploadWithTag'>;

export function FileUploadComponent({ componentValidations, node }: IFileUploadWithTagProps): JSX.Element {
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
    type,
  } = node.item;
  const dataDispatch = useAppDispatch();
  const [validations, setValidations] = React.useState<string[]>([]);
  const [validationsWithTag, setValidationsWithTag] = React.useState<Array<{ id: string; message: string }>>([]);
  const [showFileUpload, setShowFileUpload] = React.useState(false);
  const mobileView = useIsMobileOrTablet();
  const attachments: IAttachment[] = useAppSelector((state: IRuntimeState) => state.attachments.attachments[id] || []);
  const hasTag = type === 'FileUploadWithTag';
  const langTools = useLanguage();
  const { lang, langAsString } = langTools;

  const options = useAppSelector((state) => {
    const optionsId = ('optionsId' in node.item && node.item?.optionsId) ?? '';
    const mapping = ('mapping' in node.item && node.item?.mapping) || undefined;
    if (optionsId) {
      return state.optionState.options[
        getOptionLookupKey({
          id: optionsId,
          mapping,
        })
      ]?.options;
    } else {
      return undefined;
    }
  });

  // Get data from validations based on hasTag.
  const { validationMessages, hasValidationMessages, ...otherValidationData } = hasTag
    ? validateWithTag({
        setValidationsWithTag,
        validationsWithTag,
        componentValidations,
      })
    : validateWithoutTag({
        componentValidations,
        validations,
      });
  const { setValidationsFromArray, attachmentValidationMessages } = otherValidationData as {
    setValidationsFromArray: (validationArray: string[]) => void;
    attachmentValidationMessages: { id: string; message: string }[];
  };

  const shouldShowFileUpload = (): boolean => {
    if (attachments.length >= maxNumberOfAttachments) {
      return false;
    }
    return displayMode !== 'simple' || attachments.length === 0 || showFileUpload === true;
  };

  const renderAddMoreAttachmentsButton = (): JSX.Element | null => {
    const shouldShowButton =
      displayMode === 'simple' &&
      !showFileUpload &&
      attachments.length < maxNumberOfAttachments &&
      attachments.length > 0;

    return shouldShowButton ? (
      <button
        className={`${classes.fileUploadButton} ${classes.blueUnderline}`}
        onClick={() => setShowFileUpload(true)}
      >
        {lang('form_filler.file_uploader_add_attachment')}
      </button>
    ) : null;
  };

  const handleDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    const fileType = baseComponentId || id;
    const totalAttachments = acceptedFiles.length + rejectedFiles.length + attachments.length;

    if (totalAttachments > maxNumberOfAttachments) {
      // if the user adds more attachments than max, all should be ignored
      const errorText = `${langAsString(
        'form_filler.file_uploader_validation_error_exceeds_max_files_1',
      )} ${maxNumberOfAttachments} ${langAsString('form_filler.file_uploader_validation_error_exceeds_max_files_2')}`;

      hasTag ? setValidationsFromArray([errorText]) : setValidations([errorText]);
    } else {
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
      hasTag ? setValidationsFromArray(rejections) : setValidations(rejections);
    }
  };

  const renderValidationMessages =
    hasValidationMessages && !showFileUpload && renderValidationMessagesForComponent(validationMessages, id);

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
        <>
          <AttachmentsCounter
            currentNumberOfAttachments={attachments.length}
            minNumberOfAttachments={minNumberOfAttachments}
            maxNumberOfAttachments={maxNumberOfAttachments}
          />
          {renderValidationMessages}
        </>
      )}

      <FileTableComponent
        node={node}
        mobileView={mobileView}
        attachments={attachments}
        attachmentValidations={attachmentValidationMessages}
        options={options}
        validationsWithTag={validationsWithTag}
        setValidationsWithTag={setValidationsWithTag}
      />

      {!shouldShowFileUpload() && (
        <>
          <AttachmentsCounter
            currentNumberOfAttachments={attachments.length}
            minNumberOfAttachments={minNumberOfAttachments}
            maxNumberOfAttachments={maxNumberOfAttachments}
          />
          {renderValidationMessages}
        </>
      )}
      {renderAddMoreAttachmentsButton()}
    </div>
  );
}

interface IValidateWithTag {
  setValidationsWithTag: (validationArray: { id: string; message: string }[]) => void;
  validationsWithTag: {
    id: string;
    message: string;
  }[];
  componentValidations: IComponentValidations | undefined;
}

const validateWithTag = ({ setValidationsWithTag, validationsWithTag, componentValidations }: IValidateWithTag) => {
  const setValidationsFromArray = (validationArray: string[]) => {
    setValidationsWithTag(parseFileUploadComponentWithTagValidationObject(validationArray));
  };

  // Get validations and filter general from identified validations.
  const tmpValidationMessages = getFileUploadWithTagComponentValidations(componentValidations, validationsWithTag);
  const validationMessages = {
    errors: tmpValidationMessages.filter(isNotAttachmentError).map((el) => el.message),
  };
  const attachmentValidationMessages = tmpValidationMessages.filter(isAttachmentError);
  const hasValidationMessages: boolean = validationMessages.errors.length > 0;

  return {
    setValidationsFromArray,
    attachmentValidationMessages,
    hasValidationMessages,
    validationMessages,
  };
};

interface IValidateWithoutTag {
  componentValidations: IComponentValidations | undefined;
  validations: string[];
}

const validateWithoutTag = ({ componentValidations, validations }: IValidateWithoutTag) => {
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
  const validationMessages = getComponentValidations().simpleBinding;
  const hasValidationMessages = validationMessages?.errors && validationMessages.errors.length > 0;
  return {
    validationMessages,
    hasValidationMessages,
  };
};
