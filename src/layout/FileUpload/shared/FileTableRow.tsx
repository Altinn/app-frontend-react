import React, { useState } from 'react';

import { Button } from '@digdir/design-system-react';
import { CheckmarkCircleFillIcon, PencilIcon, TrashIcon } from '@navikt/aksel-icons';

import { AltinnLoader } from 'src/components/AltinnLoader';
import { DeleteWarningPopover } from 'src/components/molecules/DeleteWarningPopover';
import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useLanguage } from 'src/hooks/useLanguage';
import { AttachmentFileName } from 'src/layout/FileUpload/shared/AttachmentFileName';
import classes from 'src/layout/FileUpload/shared/FileTableRow.module.css';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';
import type { IAttachment } from 'src/features/attachments';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

class IFileUploadTableRowProps {
  attachment: IAttachment;
  mobileView: boolean;
  index: number;
  node: LayoutNodeFromType<'FileUpload'> | LayoutNodeFromType<'FileUploadWithTag'>;
  onEdit?: (index: any) => void;
  tagLabel?: string | undefined;
}

export const bytesInOneMB = 1048576;

export function FileTableRow({ node, attachment, mobileView, index, onEdit, tagLabel }: IFileUploadTableRowProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { id, alertOnDelete, baseComponentId, dataModelBindings } = node.item;
  const { langAsString } = useLanguage();
  const handleDeleteClick = () => {
    alertOnDelete ? setPopoverOpen(!popoverOpen) : handleDeleteFile();
  };

  const readableSize = `${(attachment.size / bytesInOneMB).toFixed(2)} ${langAsString('form_filler.file_uploader_mb')}`;

  const handlePopoverDeleteClick = () => {
    setPopoverOpen(false);
    handleDeleteFile();
  };

  const handleDeleteFile = () => {
    dispatch(
      AttachmentActions.deleteAttachment({
        attachment,
        attachmentType: baseComponentId ?? id,
        componentId: id,
        dataModelBindings,
      }),
    );
  };

  return (
    <tr
      key={attachment.id}
      className={classes.blueUnderlineDotted}
      id={`altinn-file-list-row-${attachment.id}`}
      tabIndex={0}
    >
      <NameCell
        attachment={attachment}
        mobileView={mobileView}
        readableSize={readableSize}
        tagLabel={tagLabel}
      />
      {tagLabel && (
        <FileTypeCell
          tagLabel={tagLabel}
          index={index}
        />
      )}
      {!(tagLabel && mobileView) && (
        <StatusCellContent
          uploaded={attachment.uploaded}
          mobileView={mobileView}
        />
      )}
      <ButtonCellContent
        deleting={attachment.deleting}
        handleDeleteClick={handleDeleteClick}
        handlePopoverDeleteClick={handlePopoverDeleteClick}
        index={index}
        alertOnDelete={alertOnDelete}
        mobileView={mobileView}
        setPopoverOpen={setPopoverOpen}
        popoverOpen={popoverOpen}
        onEdit={onEdit}
        tagLabel={tagLabel}
      />
    </tr>
  );
}

const NameCell = ({
  mobileView,
  attachment,
  readableSize,
  tagLabel,
}: {
  mobileView: boolean;
  attachment: Pick<IAttachment, 'name' | 'size' | 'id' | 'uploaded'>;
  readableSize: string;
  tagLabel?: string | undefined;
}) => {
  const { langAsString } = useLanguage();
  return (
    <>
      <td>
        <div style={{ minWidth: '0px' }}>
          <AttachmentFileName
            attachment={attachment}
            mobileView={mobileView}
          />
          {mobileView && (
            <div
              style={{
                color: AltinnAppTheme.altinnPalette.primary.grey,
              }}
            >
              {attachment.uploaded ? (
                <div>
                  {readableSize}
                  {tagLabel && (
                    <CheckmarkCircleFillIcon
                      aria-label={langAsString('form_filler.file_uploader_list_status_done')}
                      role='img'
                      style={{ marginLeft: '5px' }}
                    />
                  )}
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
          )}
        </div>
      </td>
      {!mobileView ? <td>{readableSize}</td> : null}
    </>
  );
};

const FileTypeCell = ({ index, tagLabel }) => {
  const { langAsString } = useLanguage();
  return <td key={`attachment-tag-${index}`}>{tagLabel && langAsString(tagLabel)}</td>;
};

const StatusCellContent = ({ uploaded, mobileView }) => {
  const { langAsString } = useLanguage();
  const status = uploaded
    ? langAsString('form_filler.file_uploader_list_status_done')
    : langAsString('general.loading');

  return (
    <td>
      {uploaded ? (
        <div className={classes.fileStatus}>
          {mobileView ? null : status}
          <CheckmarkCircleFillIcon
            data-testid='checkmark-success'
            style={mobileView ? { marginLeft: '10px' } : {}}
            aria-hidden={!mobileView}
            aria-label={status}
            role='img'
          />
        </div>
      ) : (
        <AltinnLoader
          id='loader-upload'
          style={{
            marginBottom: '1rem',
            marginRight: '0.8125rem',
          }}
          srContent={status}
        />
      )}
    </td>
  );
};

const ButtonCellContent = ({
  deleting,
  handleDeleteClick,
  handlePopoverDeleteClick,
  index,
  alertOnDelete,
  mobileView,
  setPopoverOpen,
  popoverOpen,
  onEdit,
  tagLabel,
}: {
  deleting: boolean;
  handleDeleteClick: () => void;
  handlePopoverDeleteClick: () => void;
  index: number;
  alertOnDelete?: boolean;
  mobileView: boolean;
  setPopoverOpen: (open: boolean) => void;
  popoverOpen: boolean;
  onEdit?: (index: any) => void;
  tagLabel: string | undefined;
}) => {
  const { lang, langAsString } = useLanguage();

  return (
    <td>
      {deleting ? (
        <AltinnLoader
          id='loader-delete'
          className={classes.deleteLoader}
          srContent={langAsString('general.loading')}
        />
      ) : (
        (() => {
          const button = (
            <Button
              className={classes.button}
              size='small'
              variant='quiet'
              color={tagLabel ? 'secondary' : 'danger'}
              onClick={() => (onEdit ? onEdit(index) : handleDeleteClick())}
              icon={tagLabel ? <PencilIcon aria-hidden={true} /> : <TrashIcon aria-hidden={true} />}
              iconPlacement='right'
              data-testid={`attachment-delete-${index}`}
              aria-label={langAsString(tagLabel ? 'general.edit_alt' : 'general.delete')}
            >
              {!mobileView && lang(tagLabel ? 'general.edit_alt' : 'form_filler.file_uploader_list_delete')}
            </Button>
          );
          if (alertOnDelete && !tagLabel) {
            return (
              <DeleteWarningPopover
                trigger={button}
                placement='left'
                onPopoverDeleteClick={() => handlePopoverDeleteClick()}
                onCancelClick={() => setPopoverOpen(false)}
                deleteButtonText={langAsString('form_filler.file_uploader_delete_button_confirm')}
                messageText={langAsString('form_filler.file_uploader_delete_warning')}
                open={popoverOpen}
                setOpen={setPopoverOpen}
              />
            );
          } else {
            return button;
          }
        })()
      )}
    </td>
  );
};
