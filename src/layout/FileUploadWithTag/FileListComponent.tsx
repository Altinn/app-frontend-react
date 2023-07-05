import React from 'react';

import { Button, ButtonColor, ButtonSize, ButtonVariant } from '@digdir/design-system-react';
import { CheckmarkCircleFillIcon, PencilIcon } from '@navikt/aksel-icons';

import { AltinnLoader } from 'src/components/AltinnLoader';
import { useLanguage } from 'src/hooks/useLanguage';
import { AttachmentFileName } from 'src/layout/FileUpload/shared/AttachmentFileName';
import { EditWindowComponent } from 'src/layout/FileUploadWithTag/EditWindowComponent';
import classes from 'src/layout/FileUploadWithTag/FileListComponent.module.css';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';
import { atleastOneTagExists } from 'src/utils/formComponentUtils';
import type { IAttachment } from 'src/features/attachments';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IOption } from 'src/types';

export interface FileListProps {
  node: PropsFromGenericComponent<'FileUploadWithTag'>['node'];
  attachments: IAttachment[];
  editIndex: number;
  mobileView: boolean;
  options?: IOption[];
  onEdit: (index: any) => void;
  onSave: (attachment: IAttachment) => void;
  onDropdownDataChange: (id: string, value: string) => void;
  setEditIndex: (index: number) => void;
  attachmentValidations: {
    id: string;
    message: string;
  }[];
}

export const bytesInOneMB = 1048576;

export function FileList({
  attachmentValidations,
  attachments,
  editIndex,
  mobileView,
  node,
  onDropdownDataChange,
  onEdit,
  onSave,
  options,
  setEditIndex,
}: FileListProps): JSX.Element | null {
  const { lang, langAsString } = useLanguage();

  if (!attachments || attachments.length === 0) {
    return null;
  }
  const { textResourceBindings } = node.item;

  return (
    <div
      data-testid='tagFile'
      id='tagFile'
    >
      <table className={!mobileView ? classes.table : classes.tableMobile}>
        {atleastOneTagExists(attachments) && (
          <thead className={classes.tableHeader}>
            <tr className={mobileView ? classes.mobileTableRow : ''}>
              <th align='left'>{lang('form_filler.file_uploader_list_header_name')}</th>
              <th align='left'>{textResourceBindings?.tagTitle && langAsString(textResourceBindings.tagTitle)}</th>
              {!mobileView ? <th align='left'>{lang('form_filler.file_uploader_list_header_file_size')}</th> : null}
              {!mobileView ? <th align='left'>{lang('form_filler.file_uploader_list_header_status')}</th> : null}
              <th />
            </tr>
          </thead>
        )}
        <tbody className={classes.tableBody}>
          {attachments.map((attachment: IAttachment, index: number) => {
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
                        attachment={attachments[index]}
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
                              id={`attachment-loader-upload-${attachments[index].id}`}
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
                    attachment={attachments[index]}
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
          })}
        </tbody>
      </table>
    </div>
  );
}
