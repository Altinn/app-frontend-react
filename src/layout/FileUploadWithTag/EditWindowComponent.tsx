import React, { useState } from 'react';

import { Button, Select } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';
import { CheckmarkCircleFillIcon } from '@navikt/aksel-icons';

import { AltinnLoader } from 'src/components/AltinnLoader';
import { isAttachmentUploaded } from 'src/features/attachments';
import { useAttachmentsUpdater } from 'src/features/attachments/AttachmentsContext';
import { useFormattedOptions } from 'src/hooks/useFormattedOptions';
import { useLanguage } from 'src/hooks/useLanguage';
import { AttachmentFileName } from 'src/layout/FileUpload/FileUploadTable/AttachmentFileName';
import { FileTableButtons } from 'src/layout/FileUpload/FileUploadTable/FileTableButtons';
import { useFileTableRowContext } from 'src/layout/FileUpload/FileUploadTable/FileTableRowContext';
import classes from 'src/layout/FileUploadWithTag/EditWindowComponent.module.css';
import { renderValidationMessages } from 'src/utils/render';
import type { IAttachment } from 'src/features/attachments';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IOption } from 'src/layout/common.generated';

export interface EditWindowProps {
  node: PropsFromGenericComponent<'FileUploadWithTag'>['node'];
  attachment: IAttachment;
  mobileView: boolean;
  options?: IOption[];
  attachmentValidations: {
    id: string;
    message: string;
  }[];
  validationsWithTag: {
    id: string;
    message: string;
  }[];
  setValidationsWithTag: (validationArray: { id: string; message: string }[]) => void;
}

export function EditWindowComponent({
  attachment,
  attachmentValidations,
  mobileView,
  node,
  options,
  validationsWithTag,
  setValidationsWithTag,
}: EditWindowProps): React.JSX.Element {
  const { textResourceBindings, readOnly } = node.item;
  const { lang, langAsString } = useLanguage();
  const { setEditIndex } = useFileTableRowContext();
  const uploadedAttachment = isAttachmentUploaded(attachment) ? attachment : undefined;
  const rawSelectedTag = uploadedAttachment?.data.tags ? uploadedAttachment.data.tags[0] : undefined;
  const [chosenOption, setChosenOption] = useState<IOption | undefined>(
    rawSelectedTag ? options?.find((o) => o.value === rawSelectedTag) : undefined,
  );
  const formattedOptions = useFormattedOptions(options);
  const updateAttachment = useAttachmentsUpdater();

  const onDropdownDataChange = (value: string) => {
    if (value !== undefined) {
      const option = options?.find((o) => o.value === value);
      if (option !== undefined) {
        setChosenOption(option);
      } else {
        console.error(`Could not find option for ${value}`);
      }
    }
  };

  const handleSave = () => {
    if (!uploadedAttachment) {
      return;
    }

    const { id, tags: _tags } = uploadedAttachment.data;
    const existingTags = _tags || [];

    if (chosenOption) {
      setEditIndex(-1);
      if (chosenOption.value !== existingTags[0]) {
        setAttachmentTag(chosenOption);
      }
      setValidationsWithTag(validationsWithTag.filter((obj) => obj.id !== id)); // Remove old validation if exists
    } else {
      const tmpValidations: { id: string; message: string }[] = [];
      tmpValidations.push({
        id,
        message: `${langAsString('form_filler.file_uploader_validation_error_no_chosen_tag')} ${(
          langAsString(textResourceBindings?.tagTitle || '') || ''
        )
          .toString()
          .toLowerCase()}.`,
      });
      setValidationsWithTag(validationsWithTag.filter((obj) => obj.id !== tmpValidations[0].id).concat(tmpValidations));
    }
  };

  const setAttachmentTag = (option: IOption) => {
    if (!isAttachmentUploaded(attachment)) {
      return;
    }

    updateAttachment({
      attachment,
      tags: [option.value],
    }).then();
  };

  const saveIsDisabled = attachment.updating || !attachment.uploaded || readOnly;
  const uniqueId = isAttachmentUploaded(attachment) ? attachment.data.id : attachment.data.temporaryId;

  return (
    <div
      id={`attachment-edit-window-${uniqueId}`}
      className={classes.editContainer}
    >
      <Grid
        justifyContent='space-between'
        container={true}
        spacing={0}
        direction='row'
        style={{ flexWrap: 'nowrap' }}
      >
        <Grid
          className={classes.textContainer}
          style={{ flexShrink: 1 }}
        >
          <AttachmentFileName
            attachment={attachment}
            mobileView={mobileView}
          />
        </Grid>
        <Grid
          className={classes.textContainer}
          style={{ flexShrink: 0 }}
        >
          <div className={classes.iconButtonWrapper}>
            {attachment.uploaded && (
              <div style={{ marginLeft: '0.9375rem', marginRight: '0.9375rem' }}>
                {!mobileView ? lang('form_filler.file_uploader_list_status_done') : undefined}
                <CheckmarkCircleFillIcon
                  role='img'
                  aria-hidden={!mobileView}
                  aria-label={langAsString('form_filler.file_uploader_list_status_done')}
                  className={classes.checkMark}
                  data-testid='checkmark-success'
                />
              </div>
            )}
            {!attachment.uploaded && (
              <AltinnLoader
                id={`attachment-loader-upload-${uniqueId}`}
                style={{
                  width: '80px',
                }}
                srContent={langAsString('general.loading')}
              />
            )}
            <div>
              <FileTableButtons
                node={node}
                mobileView={mobileView}
                attachment={attachment}
                editWindowIsOpen={true}
              />
            </div>
          </div>
        </Grid>
      </Grid>
      <Grid
        container
        direction='column'
        className={classes.gap}
      >
        {textResourceBindings?.tagTitle && (
          <label
            className={classes.label}
            htmlFor={`attachment-tag-dropdown-${uniqueId}`}
          >
            {lang(textResourceBindings?.tagTitle)}
          </label>
        )}
        <Grid
          container
          direction='row'
          wrap='wrap'
          className={classes.gap}
        >
          <Grid
            item={true}
            style={{ minWidth: '150px' }}
            xs
          >
            <Select
              inputId={`attachment-tag-dropdown-${uniqueId}`}
              onChange={onDropdownDataChange}
              options={formattedOptions}
              disabled={saveIsDisabled}
              error={attachmentValidations.filter((i) => i.id === uniqueId).length > 0}
              label={langAsString('general.choose')}
              hideLabel={true}
              value={chosenOption?.value}
            />
          </Grid>
          <Grid
            item={true}
            xs='auto'
          >
            {attachment.updating ? (
              <AltinnLoader
                id={`attachment-loader-update-${uniqueId}`}
                srContent={langAsString('general.loading')}
                style={{
                  height: '30px',
                  padding: '7px 34px 5px 28px',
                }}
              />
            ) : (
              <Button
                size='small'
                onClick={() => handleSave()}
                id={`attachment-save-tag-button-${uniqueId}`}
                disabled={saveIsDisabled}
              >
                {lang('general.save')}
              </Button>
            )}
          </Grid>
        </Grid>
      </Grid>
      {attachmentValidations.filter((i) => i.id === uniqueId).length > 0 ? (
        <div
          style={{
            whiteSpace: 'pre-wrap',
          }}
        >
          {renderValidationMessages(
            attachmentValidations.filter((i) => i.id === uniqueId).map((e) => e.message),
            `attachment-error-${uniqueId}`,
            'error',
          )}
        </div>
      ) : undefined}
    </div>
  );
}
