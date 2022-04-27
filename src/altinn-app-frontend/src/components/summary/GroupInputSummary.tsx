import * as React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import InputSummaryBoilerplate from 'src/components/summary/InputSummaryBoilerplate';

export interface ISingleInputSummary {
  formData: any;
  label: any;
}

const useStyles = makeStyles({
  label: {
    fontWeight: 500,
    '& p': {
      fontWeight: 500,
    },
  },
});

function GroupInputSummary({ formData, label }: ISingleInputSummary) {
  const [displayData, setDisplayData] = React.useState<string>('');
  const classes = useStyles();
  return (
    <InputSummaryBoilerplate
      formData={formData}
      setDisplayData={setDisplayData}
    >
      <Typography variant='body1'>
        <span className={classes.label}>
          {label} {': '}
        </span>
        <span>{displayData}</span>
      </Typography>
    </InputSummaryBoilerplate>
  );
}

export default GroupInputSummary;
