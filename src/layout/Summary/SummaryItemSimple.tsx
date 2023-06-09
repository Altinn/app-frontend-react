import React from 'react';

import { useLanguage } from 'src/hooks/useLanguage';
import classes from 'src/layout/Summary/SummaryItemSimple.module.css';

export interface ISummaryItemSimple {
  formDataAsString: string | undefined;
}

export function SummaryItemSimple({ formDataAsString }: ISummaryItemSimple) {
  const { lang } = useLanguage();
  return (
    <div data-testid={'summary-item-simple'}>
      {formDataAsString ? (
        <span className={classes.data}>{formDataAsString}</span>
      ) : (
        <span className={classes.emptyField}>{lang('general.empty_summary')}</span>
      )}
    </div>
  );
}
