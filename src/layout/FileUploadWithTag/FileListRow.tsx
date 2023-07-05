import React from 'react';

import { Button, ButtonColor, ButtonSize, ButtonVariant } from '@digdir/design-system-react';
import { CheckmarkCircleFillIcon, PencilIcon } from '@navikt/aksel-icons';

import type { PropsFromGenericComponent } from '..';

import { AltinnLoader } from 'src/components/AltinnLoader';
import { useLanguage } from 'src/hooks/useLanguage';
import { AttachmentFileName } from 'src/layout/FileUpload/shared/AttachmentFileName';
import { EditWindowComponent } from 'src/layout/FileUploadWithTag/EditWindowComponent';
import classes from 'src/layout/FileUploadWithTag/FileListComponent.module.css';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';
import type { IAttachment } from 'src/features/attachments';
import type { IOption } from 'src/types';

type FileListRowProps = {
  attachment: IAttachment;
  index: number;
  mobileView: boolean;
  options?: IOption[];
  onEdit: (index: any) => void;
  onSave: (attachment: IAttachment) => void;
  onDropdownDataChange: (id: string, value: string) => void;
  editIndex: number;
  setEditIndex: (index: number) => void;
  attachmentValidations: {
    id: string;
    message: string;
  }[];
  node: PropsFromGenericComponent<'FileUploadWithTag'>['node'];
};

export const bytesInOneMB = 1048576;

export function FileListRow({
  attachment,
  options,
  mobileView,
  index,
  editIndex,
  setEditIndex,
  onEdit,
  onSave,
  onDropdownDataChange,
  node,
  attachmentValidations,
}: FileListRowProps) {
  const { lang, langAsString } = useLanguage();

  // Check if filter is applied and includes specified index.
  if (attachment.tags !== undefined && attachment.tags.length > 0 && editIndex !== index) {
    const firstTag = attachment.tags[0];
    const label = options?.find((option) => option.value === firstTag)?.label;

    return (
      <tr
        key={`altinn-file-list-row-${attachment.id}`}
        className={mobileView ? classes.mobileTableRow : ''}
      >
        <td key={`attachment-name-${index}`}>
          <div style={{ minWidth: '0px' }}>
            <AttachmentFileName
              attachment={attachment}
              mobileView={mobileView}
            />
            {mobileView ? (
              <div
                style={{
                  color: AltinnAppTheme.altinnPalette.primary.grey,
                }}
              >
                {attachment.uploaded ? (
                  <div>
                    {(attachment.size / bytesInOneMB).toFixed(2)} {lang('form_filler.file_uploader_mb')}
                    <CheckmarkCircleFillIcon
                      aria-label={langAsString('form_filler.file_uploader_list_status_done')}
                      role='img'
                      style={{ marginLeft: '5px' }}
                    />
                  </div>
                ) : (
                  <AltinnLoader
                    id={`attachment-loader-upload-${attachment.id}`}
                    style={{
                      marginBottom: '1rem',
                      marginRight: '0.8125rem',
                    }}
                    srContent={langAsString('general.loading')}
                  />
                )}
              </div>
            ) : null}
          </div>
        </td>
        <td key={`attachment-tag-${index}`}>{label && langAsString(label)}</td>
        {!mobileView ? (
          <td key={`attachment-size-${index}`}>
            {`${(attachment.size / bytesInOneMB).toFixed(2)} ${langAsString('form_filler.file_uploader_mb')}`}
          </td>
        ) : null}
        {!mobileView ? (
          <td key={`attachment-status-${index}`}>
            {attachment.uploaded ? (
              <div className={classes.fileStatus}>
                {lang('form_filler.file_uploader_list_status_done')}
                <CheckmarkCircleFillIcon aria-hidden={true} />
              </div>
            ) : (
              <AltinnLoader
                id={`attachment-loader-upload-${attachment.id}`}
                style={{
                  marginBottom: '1rem',
                  marginRight: '0.8125rem',
                }}
                srContent={langAsString('general.loading')}
              />
            )}
          </td>
        ) : null}
        <td
          align='right'
          key={`edit-${index}`}
        >
          <Button
            className={classes.editButton}
            size={ButtonSize.Small}
            variant={ButtonVariant.Quiet}
            color={ButtonColor.Secondary}
            onClick={() => onEdit(index)}
            icon={<PencilIcon aria-hidden={true} />}
            iconPlacement='right'
          >
            {!mobileView && lang('general.edit_alt')}
          </Button>
        </td>
      </tr>
    );
  }

  return (
    <tr key={`altinn-unchosen-option-attachment-row-${index}`}>
      <td
        className={mobileView ? classes.fullGrid : ''}
        colSpan={!mobileView ? 5 : undefined}
      >
        <EditWindowComponent
          node={node}
          attachment={attachment}
          attachmentValidations={[
            ...new Map(attachmentValidations.map((validation) => [validation['id'], validation])).values(),
          ]}
          mobileView={mobileView}
          options={options}
          onSave={onSave}
          onDropdownDataChange={onDropdownDataChange}
          setEditIndex={setEditIndex}
        />
      </td>
    </tr>
  );
}
