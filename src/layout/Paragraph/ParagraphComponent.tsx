import React from 'react';

import { Grid, makeStyles, Typography } from '@material-ui/core';

import { HelpTextContainer } from 'src/components/form/HelpTextContainer';
import { getParsedLanguageFromText } from 'src/language/sharedLanguage';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';
import { getPlainTextFromNode } from 'src/utils/stringHelper';
import type { PropsFromGenericComponent } from 'src/layout';

export type IParagraphProps = PropsFromGenericComponent<'Paragraph'>;

const useStyles = makeStyles({
  spacing: {
    '@media only screen': {
      letterSpacing: '0.3px',
      maxWidth: '684px',
      marginTop: '-12px',
    },
  },
  // Class to override default stylings for headers created by markdown parsing. Done to align help text icon.
  typography: {
    '& h1': {
      margin: 0,
    },
    '& h2': {
      margin: 0,
    },
    '& h3': {
      margin: 0,
    },
    '& h4': {
      margin: 0,
    },
    '& h5': {
      margin: 0,
    },
    '& h6': {
      margin: 0,
    },
    '& *': {
      // TODO: Remove when switching to 'Inter'
      fontFamily: AltinnAppTheme.typography.fontFamily,
    },
  },
});

export function ParagraphComponent({ node, getTextResourceAsString, getTextResource, language }: IParagraphProps) {
  const { id, textResourceBindings } = node.item;
  const classes = useStyles();

  const text = getParsedLanguageFromText(getTextResourceAsString(textResourceBindings?.title) ?? '', {}, false);

  return (
    <Grid
      container={true}
      direction='row'
      alignItems='center'
    >
      <Grid item={true}>
        <Typography
          component={'div'}
          id={id}
          data-testid={`paragraph-component-${id}`}
          className={`${classes.spacing} ${classes.typography}`}
        >
          {text}
        </Typography>
      </Grid>
      {textResourceBindings?.help && (
        <Grid
          item={true}
          className={classes.spacing}
        >
          <HelpTextContainer
            language={language}
            helpText={getTextResource(textResourceBindings.help)}
            title={getPlainTextFromNode(text)}
          />
        </Grid>
      )}
    </Grid>
  );
}
