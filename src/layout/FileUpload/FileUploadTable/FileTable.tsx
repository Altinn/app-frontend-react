import React from 'react';

import { isAttachmentUploaded } from 'src/features/attachments';
import { Lang } from 'src/features/language/Lang';
import { usePdfModeActive } from 'src/features/pdf/PDFWrapper';
import classes from 'src/layout/FileUpload/FileUploadTable/FileTableComponent.module.css';
import { FileTableRow } from 'src/layout/FileUpload/FileUploadTable/FileTableRow';
import { FileTableRowProvider } from 'src/layout/FileUpload/FileUploadTable/FileTableRowContext';
import { EditWindowComponent } from 'src/layout/FileUploadWithTag/EditWindowComponent';
import { atLeastOneTagExists } from 'src/utils/formComponentUtils';
import type { IAttachment } from 'src/features/attachments';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { PropsFromGenericComponent } from 'src/layout';
import type { FileTableRowContext } from 'src/layout/FileUpload/FileUploadTable/FileTableRowContext';

export interface FileTableProps {
  node: PropsFromGenericComponent<'FileUpload' | 'FileUploadWithTag'>['node'];
  attachments: IAttachment[];
  mobileView: boolean;
  options?: IOptionInternal[];
  isSummary?: boolean;
}

export function FileTable({
  attachments,
  mobileView,
  node,
  options,
  isSummary,
}: FileTableProps): React.JSX.Element | null {
  const { textResourceBindings, type } = node.item;
  const hasTag = type === 'FileUploadWithTag';
  const pdfModeActive = usePdfModeActive();
  const [editIndex, setEditIndex] = React.useState<number>(-1);
  if (!attachments || attachments.length === 0) {
    return null;
  }
  const tagTitle =
    (textResourceBindings && 'tagTitle' in textResourceBindings && textResourceBindings?.tagTitle) || undefined;
  const label = (attachment: IAttachment) => {
    if (!isAttachmentUploaded(attachment)) {
      return undefined;
    }

    const firstTag = attachment.data.tags && attachment.data.tags[0];
    return options?.find((option) => option.value === firstTag)?.label;
  };

  return (
    <table
      className={!mobileView ? classes.table : classes.tableMobile}
      data-testid={hasTag ? 'tagFile' : 'file-upload-table'}
      id={hasTag ? 'tagFile' : 'file-upload-table'}
    >
      {(atLeastOneTagExists(attachments) || !hasTag) && (
        <thead>
          <tr
            className={pdfModeActive ? classes.grayUnderline : classes.blueUnderline}
            id='altinn-file-list-row-header'
          >
            <th style={{ width: mobileView ? '80%' : '40%' }}>
              <Lang id={'form_filler.file_uploader_list_header_name'} />
            </th>
            {!mobileView && (
              <th>
                <Lang id={'form_filler.file_uploader_list_header_file_size'} />
              </th>
            )}
            {hasTag && !mobileView && (
              <th>
                <Lang id={tagTitle} />
              </th>
            )}
            {!(hasTag && mobileView) && !pdfModeActive && !mobileView && (
              <th>
                <Lang id={'form_filler.file_uploader_list_header_status'} />
              </th>
            )}

            {!pdfModeActive && (
              <th>
                <p className='sr-only'>
                  <Lang id={'form_filler.file_uploader_list_header_delete_sr'} />
                </p>
              </th>
            )}
          </tr>
        </thead>
      )}
      <tbody className={classes.tableBody}>
        {attachments.map((attachment, index: number) => {
          const canRenderRow = isAttachmentUploaded(attachment)
            ? !hasTag || (attachment.data.tags !== undefined && attachment.data.tags.length > 0 && editIndex !== index)
            : false;

          const ctx: FileTableRowContext = {
            setEditIndex,
            editIndex,
            index,
          };

          // Check if filter is applied and includes specified index.
          return canRenderRow && isAttachmentUploaded(attachment) ? (
            <FileTableRowProvider
              value={ctx}
              key={`altinn-file-list-row-${attachment.data.id}`}
            >
              <FileTableRow
                node={node}
                attachment={attachment}
                mobileView={mobileView}
                tagLabel={label(attachment)}
                isSummary={isSummary}
              />
            </FileTableRowProvider>
          ) : (
            <FileTableRowProvider
              value={ctx}
              key={`altinn-unchosen-option-attachment-row-${index}`}
            >
              <tr>
                <td
                  className={mobileView ? classes.fullGrid : ''}
                  colSpan={!mobileView ? 5 : 3}
                >
                  <EditWindowComponent
                    node={node as PropsFromGenericComponent<'FileUploadWithTag'>['node']}
                    attachment={attachment}
                    mobileView={mobileView}
                    options={options}
                  />
                </td>
              </tr>
            </FileTableRowProvider>
          );
        })}
      </tbody>
    </table>
  );
}
