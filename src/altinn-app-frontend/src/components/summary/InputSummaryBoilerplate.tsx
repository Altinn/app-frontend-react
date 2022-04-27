import * as React from 'react';
import {Grid, makeStyles, Typography} from '@material-ui/core';
import cn from 'classnames';
import {EditButton} from 'src/components/summary/EditButton';
import appTheme from 'altinn-shared/theme/altinnAppTheme';

interface BoilerplateProps extends React.PropsWithChildren<any> {
  hasValidationMessages?: boolean,
  onChangeClick: ()=> void,
  changeText: 'string',
  label: any,
}
const useStyles = makeStyles({
  label: {
    fontWeight: 500,
    fontSize: '1.8rem',
    '& p': {
      fontWeight: 500,
      fontSize: '1.8rem',
    },
  },
  labelWithError: {
    color: appTheme.altinnPalette.primary.red,
    '& p': {
      color: appTheme.altinnPalette.primary.red,
    },
  },
});
export default function AttachmentSummaryBoilerplate({ hasValidationMessages, onChangeClick, changeText, label, children }: BoilerplateProps) {
  const classes = useStyles();
  return (
    <>
      <Grid item={true} xs={10}>
        <Typography
          variant='body1'
          className={ cn(classes.label, hasValidationMessages && classes.labelWithError) }
          component='span'
        >
          {label}
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <EditButton onClick={onChangeClick} editText={changeText} />
      </Grid>
      {children}
    </>
  );
}
