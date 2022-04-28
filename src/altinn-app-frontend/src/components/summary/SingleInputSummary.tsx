import * as React from 'react';
import { Grid, Typography } from '@material-ui/core';
import {useDisplayData} from 'src/components/hooks';
import SummaryWrapper from 'src/components/summary/SummaryWrapper';

export interface ISingleInputSummary {
  formData: any;
  label: any;
  hasValidationMessages: boolean;
  changeText: any;
  onChangeClick: () => void;
  readOnlyComponent?: boolean;
}

function SingleInputSummary({ formData, ...rest }: ISingleInputSummary) {
  const displayData = useDisplayData({ formData });
  return (
    <SummaryWrapper {...rest}>
      <Grid item xs={12} data-testid={'single-input-summary'}>
        <Typography variant='body1'>{displayData}</Typography>
      </Grid>
    </SummaryWrapper>
  );
}

export default SingleInputSummary;
