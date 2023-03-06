import React from 'react';

import { Grid, makeStyles, Typography } from '@material-ui/core';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { getLanguageFromKey } from 'src/language/sharedLanguage';

export interface ISingleInputSummary {
  formDataAsString: string | undefined;
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

export function SingleInputSummary({ formDataAsString }: ISingleInputSummary) {
  const classes = useStyles();
  const language = useAppSelector((state) => state.language.language);

  return (
    <Grid
      item
      xs={12}
      data-testid={'single-input-summary'}
    >
      {formDataAsString ? (
        <Typography
          className={classes.data}
          variant='body1'
        >
          {formDataAsString}
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
