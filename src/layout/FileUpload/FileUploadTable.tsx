import React from 'react';

import classes from 'src/layout/FileUpload/FileUploadComponent.module.css';
import { FileTableHeader } from 'src/layout/FileUpload/shared/FileTableHeader';
import { FileTableRow } from 'src/layout/FileUpload/shared/FileTableRow';
import type { IAttachment } from 'src/features/attachments';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

interface IFileUploadTableProps {
  attachments: IAttachment[];
  mobileView: boolean;
  node: LayoutNodeFromType<'FileUpload'>;
}

export function FileUploadTable({ attachments, mobileView, node }: IFileUploadTableProps) {
  const id = node.item.id;
  return (
    attachments?.length > 0 && (
      <div
        id={`altinn-file-list${id}`}
        data-testid={id}
      >
        <table
          className={classes.fileUploadTable}
          data-testid='file-upload-table'
        >
          <FileTableHeader mobileView={mobileView} />
          <tbody>
            {attachments.map((attachment, index: number) => (
              <FileTableRow
                key={attachment.id}
                attachment={attachment}
                index={index}
                mobileView={mobileView}
                node={node}
              />
            ))}
          </tbody>
        </table>
      </div>
    )
  );
}
