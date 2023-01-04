import React from 'react';

import { Grid, makeStyles, Table, TableContainer } from '@material-ui/core';
import type { TableProps } from '@material-ui/core';

export interface IAltinnTableProps {
  tableLayout?: 'fixed' | 'auto';
  wordBreak?: 'break-word' | 'normal';
  id: string;
}

const useStyles = makeStyles(() => {
  return {
    table: ({ tableLayout = 'fixed', wordBreak = 'break-word' }: IAltinnTableProps) => {
      return {
        tableLayout: tableLayout,
        marginBottom: '12px',
        wordBreak,
      };
    },
  };
});

export default function AltinnTable(props: IAltinnTableProps & Omit<TableProps, 'id'>) {
  const classes = useStyles(props);
  return (
    <TableContainer
      component={Grid}
      id={`${props.id}-container`}
    >
      <Table
        className={classes.table}
        {...props}
      />
    </TableContainer>
  );
}
