import React from 'react';

import { FormLayoutActions } from 'src/features/layout/formLayoutSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import classes from 'src/layout/FileUpload/FileUploadTable/FileTableComponent.module.css';
import { FileTableHeader } from 'src/layout/FileUpload/FileUploadTable/FileTableHeader';
import { FileTableRow } from 'src/layout/FileUpload/FileUploadTable/FileTableRow';
import { EditWindowComponent } from 'src/layout/FileUploadWithTag/EditWindowComponent';
import { atleastOneTagExists } from 'src/utils/formComponentUtils';
import type { IAttachment } from 'src/features/attachments';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IOption, IRuntimeState } from 'src/types';

export interface FileTableProps {
  node: PropsFromGenericComponent<'FileUpload' | 'FileUploadWithTag'>['node'];
  attachments: IAttachment[];
  mobileView: boolean;
  options?: IOption[];
  attachmentValidations?: {
    id: string;
    message: string;
  }[];
  validationsWithTag?: {
    id: string;
    message: string;
  }[];
  setValidationsWithTag?: (validationArray: { id: string; message: string }[]) => void;
}

export function FileTableComponent({
  attachments,
  mobileView,
  node,
  attachmentValidations,
  options,
  validationsWithTag,
  setValidationsWithTag,
}: FileTableProps): JSX.Element | null {
  const dispatch = useAppDispatch();
  const { id, baseComponentId, textResourceBindings, type } = node.item;
  const hasTag = type === 'FileUploadWithTag';
  const editIndex = useAppSelector(
    (state: IRuntimeState) =>
      (state.formLayout.uiConfig.fileUploadersWithTag &&
        state.formLayout.uiConfig.fileUploadersWithTag[id]?.editIndex) ??
      -1,
  );

  if (!attachments || attachments.length === 0) {
    return null;
  }
  const tagTitle =
    (textResourceBindings && 'tagTitle' in textResourceBindings && textResourceBindings?.tagTitle) || undefined;
  const renderRow = (attachment: IAttachment, index: number) =>
    !hasTag || (attachment.tags !== undefined && attachment.tags.length > 0 && editIndex !== index);
  const label = (attachment: IAttachment) => {
    const firstTag = attachment.tags && attachment.tags[0];
    return options?.find((option) => option.value === firstTag)?.label;
  };

  const setEditIndex = (index: number) => {
    dispatch(
      FormLayoutActions.updateFileUploaderWithTagEditIndex({
        componentId: id,
        baseComponentId: baseComponentId || id,
        index,
      }),
    );
  };

  return (
    <div
      data-testid='tagFile'
      id='tagFile'
    >
      <table className={!mobileView ? classes.table : classes.tableMobile}>
        {(atleastOneTagExists(attachments) || !hasTag) && (
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
                editIndex={editIndex}
                setEditIndex={setEditIndex}
                tagLabel={label(attachment)}
              />
            ) : (
              <tr key={`altinn-unchosen-option-attachment-row-${index}`}>
                <td
                  className={mobileView ? classes.fullGrid : ''}
                  colSpan={!mobileView ? 5 : 3}
                >
                  {
                    <EditWindowComponent
                      node={node as PropsFromGenericComponent<'FileUploadWithTag'>['node']}
                      attachment={attachment}
                      attachmentValidations={[
                        ...new Map(attachmentValidations?.map((validation) => [validation['id'], validation])).values(),
                      ]}
                      mobileView={mobileView}
                      options={options}
                      setEditIndex={setEditIndex}
                      validationsWithTag={validationsWithTag ?? []}
                      setValidationsWithTag={setValidationsWithTag ?? (() => {})}
                    />
                  }
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
