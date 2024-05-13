import React from 'react';

import { Label } from '@digdir/designsystemet-react';
import cn from 'classnames';

import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Summary/SummaryItemSimple.module.css';

export interface ISummaryItemSimple {
  formDataAsString: string | undefined;
  hideFromVisualTesting?: boolean;
}

export const SummaryItemSimple2 = ({ formDataAsString, hideFromVisualTesting = false }: ISummaryItemSimple) => (
  <div data-testid={'summary-item-simple'}>
    <Label></Label>

    {formDataAsString ? (
      <span className={cn(classes.data, { 'no-visual-testing': hideFromVisualTesting })}>{formDataAsString}</span>
    ) : (
      <span className={classes.emptyField}>
        <Lang id={'general.empty_summary'} />
      </span>
    )}
  </div>
);
