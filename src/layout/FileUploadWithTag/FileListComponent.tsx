import React from 'react';

import { useLanguage } from 'src/hooks/useLanguage';
import classes from 'src/layout/FileUploadWithTag/FileListComponent.module.css';
import { FileListRow } from 'src/layout/FileUploadWithTag/FileListRow';
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
          {attachments.map((attachment, index: number) => (
            <FileListRow
              key={`altinn-file-list-row-${attachment.id}`}
              attachment={attachment}
              options={options}
              mobileView={mobileView}
              index={index}
              editIndex={editIndex}
              setEditIndex={setEditIndex}
              onEdit={onEdit}
              onSave={onSave}
              onDropdownDataChange={onDropdownDataChange}
              node={node}
              attachmentValidations={attachmentValidations}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
