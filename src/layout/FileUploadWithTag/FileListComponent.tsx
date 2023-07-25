import React from 'react';

import { FileTableHeader } from 'src/layout/FileUpload/shared/FileTableHeader';
import { FileTableRow } from 'src/layout/FileUpload/shared/FileTableRow';
import { EditWindowComponent } from 'src/layout/FileUploadWithTag/EditWindowComponent';
import classes from 'src/layout/FileUploadWithTag/FileListComponent.module.css';
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

// export const bytesInOneMB = 1048576;

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
  if (!attachments || attachments.length === 0) {
    return null;
  }
  const { textResourceBindings } = node.item;
  const tagTitle = textResourceBindings?.tagTitle;
  const renderRow = (attachment: IAttachment, index: number) =>
    attachment.tags !== undefined && attachment.tags.length > 0 && editIndex !== index;
  const label = (attachment: IAttachment) => {
    const firstTag = attachment.tags && attachment.tags[0];
    return options?.find((option) => option.value === firstTag)?.label;
  };

  return (
    <div
      data-testid='tagFile'
      id='tagFile'
    >
      <table className={!mobileView ? classes.table : classes.tableMobile}>
        {atleastOneTagExists(attachments) && (
          <FileTableHeader
            mobileView={mobileView}
            tagTitle={tagTitle}
          />
        )}
        <tbody className={classes.tableBody}>
          {attachments.map((attachment, index: number) =>
            // Check if filter is applied and includes specified index.
            renderRow(attachment, index) ? (
              <FileTableRow
                key={`altinn-file-list-row-${attachment.id}`}
                node={node}
                attachment={attachment}
                mobileView={mobileView}
                index={index}
                onEdit={onEdit}
                tagLabel={label(attachment)}
              />
            ) : (
              <tr key={`altinn-unchosen-option-attachment-row-${index}`}>
                <td
                  className={mobileView ? classes.fullGrid : ''}
                  colSpan={!mobileView ? 5 : 3}
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
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
