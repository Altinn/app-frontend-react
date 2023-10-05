import React from 'react';

import { Grid, Typography } from '@material-ui/core';

import { AltinnAttachment } from 'src/components/atoms/AltinnAttachment';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { selectAttachments, selectDataTypesByIds } from 'src/selectors/dataTypes';
import type { PropsFromGenericComponent } from 'src/layout';

export type IAttachmentListProps = PropsFromGenericComponent<'AttachmentList'>;

export function AttachmentListComponent({ node }: IAttachmentListProps) {
  const { dataTypeIds, includePDF } = node.item;
  const { lang } = useLanguage();
  const instance = useLaxInstanceData();
  const dataForTask = useAppSelector(selectDataTypesByIds(dataTypeIds, instance));
  const attachments = useAppSelector(selectAttachments(includePDF, dataForTask, instance));

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
