import React, { Fragment } from 'react';

import cn from 'classnames';

import classes from 'src/components/table/AltinnSummaryTable.module.css';

export type SummaryDataObject = {
  [name: string]: {
    value: string | boolean | number | null | undefined;
    hideFromVisualTesting?: boolean;
  };
};

export interface IAltinnSummaryTableProps {
  summaryDataObject: SummaryDataObject;
}

export const AltinnSummaryTable = ({ summaryDataObject }: IAltinnSummaryTableProps) => (
  <div className={classes.table}>
    {Object.entries(summaryDataObject).map(([key, value]) => (
      <Fragment key={key}>
        <div className={classes.key}>{key}:</div>
        <div className={cn({ ['no-visual-testing']: value.hideFromVisualTesting })}>{value.value}</div>
      </Fragment>
    ))}
  </div>
);
