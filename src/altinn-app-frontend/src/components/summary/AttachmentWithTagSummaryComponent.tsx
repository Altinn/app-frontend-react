import { Grid, makeStyles, Typography } from '@material-ui/core';
import * as React from 'react';
import { IAttachment } from 'src/shared/resources/attachments';
import { ISelectionComponentProps } from 'src/features/form/layout';
import { getOptionLookupKey } from 'src/utils/options';
import { useAppSelector } from 'src/common/hooks';

export interface IAttachmentWithTagSummaryComponent {
  componentRef: string;
  component: ISelectionComponentProps
}

const useStyles = makeStyles({
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px dashed #008FD6',
    marginTop: 10,
    paddingTop: 10,
  },
});

export function AttachmentWithTagSummaryComponent(
  props: IAttachmentWithTagSummaryComponent,
) {
  const classes = useStyles();
  const attachments: IAttachment[] = useAppSelector(
    (state) => state.attachments.attachments[props.componentRef],
  );
  const textResources = useAppSelector(
    (state) => state.textResources.resources,
  );
  const options = useAppSelector(
    (state) =>
      state.optionState.options[
        getOptionLookupKey(props.component.optionsId, props.component.mapping)
      ]?.options,
  );

  return (
    <Grid item xs={12} data-testid={'attachment-with-tag-summary'}>
      {attachments &&
        attachments.map((attachment) => {
          return (
            <Grid
              container={true}
              className={classes.row}
              key={`attachment-summary-${attachment.id}`}
            >
              <Typography
                key={`attachment-summary-name-${attachment.id}`}
                variant='body1'
              >
                {attachment.name}
              </Typography>
              <Typography
                key={`attachment-summary-tag-${attachment.id}`}
                variant='body1'
              >
                {attachment.tags[0] &&
                  (textResources?.find(
                    (resource) =>
                      resource.id ===
                      options?.find(
                        (option) => option.value === attachment.tags[0],
                      )?.label,
                  )?.value ||
                    options?.find(
                      (option) => option.value === attachment.tags[0],
                    )?.label)}
              </Typography>
            </Grid>
          );
        })}
    </Grid>
  );
}
