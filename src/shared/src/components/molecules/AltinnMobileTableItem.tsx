import {
  Grid,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@material-ui/core';
import React from 'react';
import theme from '../../theme/altinnStudioTheme';

export interface IMobileTableItem {
  key: React.Key;
  label: React.ReactNode;
  value: string;
}

export interface IAltinnMobileTableItemProps {
  items: IMobileTableItem[];
  valid?: boolean;
  onEditClick: () => void;
  onDeleteClick?: () => void;
  deleteIconNode?: React.ReactNode;
  editIconNode: React.ReactNode;
}

const useStyles = makeStyles({
  tableContainer: {
    borderBottom: `1px solid ${theme.altinnPalette.primary.blueMedium}`,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  table: {
    tableLayout: 'fixed',
    marginTop: '1.2rem',
    marginBottom: '1.2rem',
    '& tr': {
      '& td': {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: '50%',
        minWidth: '50%',
        padding: '0 0 0 24px',
        border: 'none',
      },
    },
  },
  tableRowError: {
    backgroundColor: '#F9CAD3;',
  },
  labelText: {
    color: theme.altinnPalette.primary.grey,
  },
  tableEditButton: {
    color: theme.altinnPalette.primary.blueDark,
    fontWeight: 700,
    borderRadius: '5px',
    padding: '6px 12px',
    margin: '8px 2px 8px -12px',
    '&:hover': {
      background: 'none',
      outline: `2px dotted ${theme.altinnPalette.primary.blueDark}`,
    },
    '&:focus': {
      background: theme.altinnPalette.primary.blueLighter,
      outline: `2px dotted ${theme.altinnPalette.primary.blueDark}`,
    },
  },
  deleteButton: {
    color: theme.altinnPalette.primary.red,
    fontWeight: 700,
    padding: '8px 12px 6px 6px',
    borderRadius: '0',
    marginRight: '-12px',
    '@media (min-width:768px)': {
      margin: '0',
    },
    '&:hover': {
      background: theme.altinnPalette.primary.red,
      color: theme.altinnPalette.primary.white,
    },
    '&:focus': {
      outlineColor: theme.altinnPalette.primary.red,
    },
    '& .ai': {
      fontSize: '2em',
      marginTop: '-3px',
    },
  },
  textContainer: {
    width: '100%',
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export default function AltinnMobileTableItem({
  items,
  valid = true,
  onEditClick,
  onDeleteClick,
  editIconNode,
  deleteIconNode,
}: IAltinnMobileTableItemProps) {
  const classes = useStyles();

  return (
    <TableContainer
      component={Grid}
      className={`${classes.tableContainer} ${
        valid ? '' : classes.tableRowError
      }`}
    >
      <Table className={classes.table}>
        <TableBody>
          {items.map((item) => {
            return (
              <TableRow key={item.key}>
                <TableCell
                  variant='head'
                  width='40%'
                >
                  <Typography
                    variant='body1'
                    className={`${classes.labelText} ${classes.textContainer}`}
                  >
                    {item.label}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant='body1'
                    className={classes.textContainer}
                  >
                    {item.value}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell>
              <IconButton
                className={classes.tableEditButton}
                onClick={onEditClick}
              >
                {editIconNode}
              </IconButton>
            </TableCell>
            <TableCell>
              <IconButton
                className={classes.deleteButton}
                onClick={onDeleteClick}
              >
                {deleteIconNode}
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
