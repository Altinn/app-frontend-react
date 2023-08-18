import React from 'react';

import { Grid, Typography } from '@material-ui/core';

import { AltinnAttachment } from 'src/components/atoms/AltinnAttachment';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { getInstancePdf, mapInstanceAttachments } from 'src/utils/attachmentsUtils';
import type { PropsFromGenericComponent } from 'src/layout';

export type IAttachmentListProps = PropsFromGenericComponent<'AttachmentList'>;

export function AttachmentListComponent({ node }: IAttachmentListProps) {
  const { dataTypeIds, includePDF } = node.item;
  const { lang } = useLanguage();
  const currentTaskId = useAppSelector((state) => state.instanceData.instance?.process?.currentTask?.elementId);
  const dataForTask = useAppSelector((state) => {
    const dataTypes = state.applicationMetadata.applicationMetadata?.dataTypes.filter(
      (type) => type.taskId === state.instanceData.instance?.process?.currentTask?.elementId,
    );
    return state.instanceData.instance?.data.filter((dataElement) => {
      if (dataTypeIds) {
        return dataTypeIds.findIndex((id) => dataElement.dataType === id) > -1;
      }
      return dataTypes && dataTypes.findIndex((type) => dataElement.dataType === type.id) > -1;
    });
  });
  const attachments = useAppSelector((state) => {
    const appLogicDataTypes = state.applicationMetadata.applicationMetadata?.dataTypes.filter(
      (dataType) => dataType.appLogic && dataType.taskId === currentTaskId,
    );
    return includePDF
      ? getInstancePdf(dataForTask)
      : mapInstanceAttachments(dataForTask, appLogicDataTypes?.map((type) => type.id) || []);
  });

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
