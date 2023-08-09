import React from 'react';

import { Button, Select } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';
import { CheckmarkCircleFillIcon } from '@navikt/aksel-icons';

import { AltinnLoader } from 'src/components/AltinnLoader';
import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { FormLayoutActions } from 'src/features/layout/formLayoutSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { AttachmentFileName } from 'src/layout/FileUpload/FileUploadTable/AttachmentFileName';
import { FileTableButtons } from 'src/layout/FileUpload/FileUploadTable/FileTableButtons';
import classes from 'src/layout/FileUploadWithTag/EditWindowComponent.module.css';
import { renderValidationMessages } from 'src/utils/render';
import type { IAttachment } from 'src/features/attachments';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IOption } from 'src/layout/common.generated';
import type { IRuntimeState } from 'src/types';

export interface EditWindowProps {
  node: PropsFromGenericComponent<'FileUploadWithTag'>['node'];
  attachment: IAttachment;
  mobileView: boolean;
  options?: IOption[];
  setEditIndex: (index: number) => void;
  index: number;
  editIndex: number;
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
  index,
  editIndex,
  attachmentValidations,
  mobileView,
  node,
  options,
  setEditIndex,
  validationsWithTag,
  setValidationsWithTag,
}: EditWindowProps): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { id, baseComponentId, textResourceBindings, readOnly } = node.item;
  const { lang, langAsString } = useLanguage();

  const onDropdownDataChange = (attachmentId: string, value: string) => {
    if (value !== undefined) {
      const option = options?.find((o) => o.value === value);
      if (option !== undefined) {
        dispatch(
          FormLayoutActions.updateFileUploaderWithTagChosenOptions({
            componentId: id,
            baseComponentId: baseComponentId || id,
            id: attachmentId,
            option,
          }),
        );
      } else {
        console.error(`Could not find option for ${value}`);
      }
    }
  };

  const chosenOptions = useAppSelector(
    (state: IRuntimeState) =>
      (state.formLayout.uiConfig.fileUploadersWithTag &&
        state.formLayout.uiConfig.fileUploadersWithTag[id]?.chosenOptions) ??
      {},
  );

  const handleSave = (attachment: IAttachment) => {
    if (chosenOptions[attachment.id] !== undefined && chosenOptions[attachment.id].length !== 0) {
      setEditIndex(-1);
      if (attachment.tags === undefined || chosenOptions[attachment.id] !== attachment.tags[0]) {
        setAttachmentTag(attachment, chosenOptions[attachment.id]);
      }
      setValidationsWithTag(validationsWithTag.filter((obj) => obj.id !== attachment.id)); // Remove old validation if exists
    } else {
      const tmpValidations: { id: string; message: string }[] = [];
      tmpValidations.push({
        id: attachment.id,
        message: `${langAsString('form_filler.file_uploader_validation_error_no_chosen_tag')} ${(
          langAsString(textResourceBindings?.tagTitle || '') || ''
        )
          .toString()
          .toLowerCase()}.`,
      });
      setValidationsWithTag(validationsWithTag.filter((obj) => obj.id !== tmpValidations[0].id).concat(tmpValidations));
    }
  };

  const setAttachmentTag = (attachment: IAttachment, optionValue: string) => {
    const option = options?.find((o) => o.value === optionValue);
    if (option !== undefined) {
      dispatch(
        AttachmentActions.updateAttachment({
          attachment,
          componentId: id,
          baseComponentId: baseComponentId || id,
          tag: option.value,
        }),
      );
    } else {
      console.error(`Could not find option for ${optionValue}`);
    }
  };

  const saveIsDisabled = attachment.updating === true || attachment.uploaded === false || readOnly;

  return (
    <div
      id={`attachment-edit-window-${attachment.id}`}
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
                id={`attachment-loader-upload-${attachment.id}`}
                style={{
                  width: '80px',
                }}
                srContent={langAsString('general.loading')}
              />
            )}
            <div>
              <FileTableButtons
                node={node}
                index={index}
                mobileView={mobileView}
                editIndex={editIndex}
                setEditIndex={setEditIndex}
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
            htmlFor={`attachment-tag-dropdown-${attachment.id}`}
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
              inputId={`attachment-tag-dropdown-${attachment.id}`}
              onChange={(value) => onDropdownDataChange(attachment.id, value)}
              options={options ?? []}
              disabled={saveIsDisabled}
              error={attachmentValidations.filter((i) => i.id === attachment.id).length > 0}
              label={langAsString('general.choose')}
              hideLabel={true}
              value={chosenOptions[attachment.id]}
            />
          </Grid>
          <Grid
            item={true}
            xs='auto'
          >
            {attachment.updating ? (
              <AltinnLoader
                id={`attachment-loader-update-${attachment.id}`}
                srContent={langAsString('general.loading')}
                style={{
                  height: '30px',
                  padding: '7px 34px 5px 28px',
                }}
              />
            ) : (
              <Button
                onClick={() => handleSave(attachment)}
                id={`attachment-save-tag-button-${attachment.id}`}
                disabled={saveIsDisabled}
              >
                {lang('general.save')}
              </Button>
            )}
          </Grid>
        </Grid>
      </Grid>
      {attachmentValidations.filter((i) => i.id === attachment.id).length > 0 ? (
        <div
          style={{
            whiteSpace: 'pre-wrap',
          }}
        >
          {renderValidationMessages(
            attachmentValidations.filter((i) => i.id === attachment.id).map((e) => e.message),
            `attachment-error-${attachment.id}`,
            'error',
          )}
        </div>
      ) : undefined}
    </div>
  );
}
