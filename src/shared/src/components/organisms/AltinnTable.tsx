import { Grid, makeStyles, Table, TableContainer } from '@material-ui/core';
import React from 'react';

export interface IAltinnTableProps {
  children: React.ReactNode;
  id: string;
  tableLayout?: 'fixed' | 'auto';
  wordBreak?: 'break-word' | 'normal';
}

const useStyles = makeStyles(() => {
  return {
    table: ({
      tableLayout = 'fixed',
      wordBreak = 'break-word',
    }: IAltinnTableProps) => {
      return {
        tableLayout: tableLayout,
        marginBottom: '12px',
        wordBreak,
      };
    },
  };
});

export default function AltinnTable(props: IAltinnTableProps) {
  const { id, children } = props;
  const classes = useStyles(props);
  return (
    <TableContainer component={Grid} id={`${id}-container`}>
      <Table className={classes.table} id={id}>
        {children}
      </Table>
    </TableContainer>
  );
}
