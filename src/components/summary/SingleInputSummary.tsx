import React from 'react';

import { Grid, makeStyles, Typography } from '@material-ui/core';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { useDisplayData } from 'src/components/hooks/useDisplayData';
import { getLanguageFromKey } from 'src/language/sharedLanguage';

export interface ISingleInputSummary {
  formData: any;
}

const useStyles = makeStyles({
  data: {
    fontWeight: 500,
    fontSize: '1.125rem',
    '& p': {
      fontWeight: 500,
      fontSize: '1.125rem',
    },
  },
  emptyField: {
    fontStyle: 'italic',
    fontSize: '1rem',
  },
});

export function SingleInputSummary({ formData }: ISingleInputSummary) {
  const classes = useStyles();
  const displayData = useDisplayData({ formData });
  const language = useAppSelector((state) => state.language.language);

  return (
    <Grid
      item
      xs={12}
      data-testid={'single-input-summary'}
    >
      {typeof displayData !== 'undefined' ? (
        <Typography
          className={classes.data}
          variant='body1'
        >
          {displayData}
        </Typography>
      ) : (
        <Typography
          variant='body1'
          className={classes.emptyField}
        >
          {getLanguageFromKey('general.empty_summary', language || {})}
        </Typography>
      )}
    </Grid>
  );
}
