import React, { useMemo } from 'react';

import { Grid, Typography } from '@material-ui/core';

import { AltinnAttachment } from 'src/components/atoms/AltinnAttachment';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { DataTypeReference, filterDisplayPdfAttachments, getDisplayAttachments } from 'src/utils/attachmentsUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IData, IDataType } from 'src/types/shared';

export type IAttachmentListProps = PropsFromGenericComponent<'AttachmentList'>;

const emptyDataArray: IData[] = [];
const emptyDataTypeArray: IDataType[] = [];

export function AttachmentListComponent({ node }: IAttachmentListProps) {
  const { lang } = useLanguage();
  const instanceData = useLaxInstanceData()?.data ?? emptyDataArray;
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  const dataTypes =
    useAppSelector((state) => state.applicationMetadata.applicationMetadata?.dataTypes) ?? emptyDataTypeArray;

  const attachments = useMemo(() => {
    const allowedTypes = new Set(node.item.dataTypeIds ?? []);

    const dataTypesInTask = new Set(dataTypes.filter((type) => type.taskId === currentTaskId).map((type) => type.id));

    // This is a list of data types that are clearly data models. We don't show those when listing attachments.
    const dataModelTypes = new Set(dataTypes.filter((dataType) => dataType.appLogic?.classRef).map((type) => type.id));

    const attachmentsForTask = instanceData.filter((el) => {
      if (el.dataType === DataTypeReference.RefDataAsPdf || dataModelTypes.has(el.dataType)) {
        return false;
      }

      if (allowedTypes.has(DataTypeReference.IncludeAll) || allowedTypes.has(el.dataType)) {
        return true;
      }

      if (allowedTypes.size === 0) {
        // If no data types are specified, we show all data types in the current task
        return dataTypesInTask.has(el.dataType);
      }

      return false;
    });

    const includePdf =
      allowedTypes.has(DataTypeReference.RefDataAsPdf) || allowedTypes.has(DataTypeReference.IncludeAll);
    const pdfAttachments = includePdf ? filterDisplayPdfAttachments(instanceData) : [];
    const otherAttachments = getDisplayAttachments(attachmentsForTask);

    return [...pdfAttachments, ...otherAttachments];
  }, [currentTaskId, dataTypes, instanceData, node.item.dataTypeIds]);

  return (
    <Grid
      item={true}
      xs={12}
    >
      <Typography variant='h2'>{lang(node.item.textResourceBindings?.title)}</Typography>
      <AltinnAttachment attachments={attachments} />
    </Grid>
  );
}
