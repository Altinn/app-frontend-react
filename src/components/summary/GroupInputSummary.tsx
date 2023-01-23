import * as React from 'react';

import { makeStyles, Typography } from '@material-ui/core';

import { useAppSelector } from 'src/common/hooks';
import { useDisplayData } from 'src/components/hooks';
import { useResolvedNode } from 'src/features/expressions/useResolvedNode';
import { getVariableTextKeysForRepeatingGroupComponent } from 'src/utils/formLayout';
import { getLanguageFromKey } from 'src/utils/sharedUtils';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { ITextResource } from 'src/types';

export interface ISingleInputSummary {
  componentId: string;
  index: number;
  formData: any;
  textResources: ITextResource[];
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
    fontSize: '1.4rem',
  },
});

export function GroupInputSummary({ index, componentId, formData, textResources }: ISingleInputSummary) {
  const displayData = useDisplayData({ formData });
  const classes = useStyles();
  const language = useAppSelector((state) => state.language.language);

  const node = useResolvedNode(componentId);
  const textBindings = node?.item.textResourceBindings;
  const textKeys = getVariableTextKeysForRepeatingGroupComponent(textResources, textBindings, index);

  return (
    <Typography variant='body1'>
      <span>
        {textKeys && getTextFromAppOrDefault(textKeys.title, textResources, {}, [], false)}
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
