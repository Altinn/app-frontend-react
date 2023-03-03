import React from 'react';

import { makeStyles, Typography } from '@material-ui/core';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { useDisplayData } from 'src/components/hooks/useDisplayData';
import { getLanguageFromKey } from 'src/language/sharedLanguage';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { LayoutNode } from 'src/utils/layout/hierarchy';

export interface IGroupInputSummary {
  targetNode: LayoutNode;
}

const useStyles = makeStyles({
  data: {
    fontWeight: 500,
    '& p': {
      fontWeight: 500,
    },
  },
  emptyField: {
    fontStyle: 'italic',
    fontSize: '0.875rem',
  },
});

export function GroupInputSummary({ targetNode }: IGroupInputSummary) {
  const formData = undefined; // PRIORITY: Find form data for component
  const displayData = useDisplayData({ formData });
  const classes = useStyles();
  const language = useAppSelector((state) => state.language.language);
  const textResources = useAppSelector((state) => state.textResources.resources);
  const textBindings = targetNode.item.textResourceBindings;

  return (
    <Typography variant='body1'>
      <span>
        {textBindings && getTextFromAppOrDefault(textBindings.title, textResources, {}, [], false)}
        {' : '}
      </span>
      {typeof displayData !== 'undefined' ? (
        <span className={classes.data}>{displayData}</span>
      ) : (
        <span className={classes.emptyField}>{getLanguageFromKey('general.empty_summary', language || {})}</span>
      )}
    </Typography>
  );
}
