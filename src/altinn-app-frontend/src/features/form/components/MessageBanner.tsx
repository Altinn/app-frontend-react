import * as React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { AltinnAppTheme } from 'altinn-shared/theme';
import { getLanguageFromKey } from 'altinn-shared/utils';
import { ILanguage } from 'altinn-shared/types';
import classNames from 'classnames';

const useStyles = makeStyles({
  banner: {
    margin: '-36px -96px 36px -96px',
    padding: '10px 96px',
  },
  default: {
    backgroundColor: AltinnAppTheme.altinnPalette.primary.greyLight,
  },
  error: {
    backgroundColor: AltinnAppTheme.altinnPalette.primary.redLight,
  }
});

export interface IMessageBannerProps {
  language: ILanguage;
  error?: boolean;
  messageKey: string;
}

export default function MessageBanner(props: IMessageBannerProps) {
  const classes = useStyles();

  return (
    <Grid
      id={'MessageBanner-container'}
      item={true}
      className={classNames(
        classes.banner,
        props.error ? classes.error : classes.default
      )}
      data-testid={'MessageBanner-container'}
    >
      <span>{getLanguageFromKey(props.messageKey, props.language)}</span>
    </Grid>
  );
}
