import React from 'react';

import { Button, ButtonColor, ButtonVariant } from '@altinn/altinn-design-system';
import {
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { Delete as DeleteIcon, Edit as EditIcon, Warning as WarningIcon } from '@navikt/ds-icons';
import cn from 'classnames';

import { ExprDefaultsForGroup } from 'src/features/expressions';
import { useExpressions } from 'src/features/expressions/useExpressions';
import type { ILayoutGroup } from 'src/features/form/layout/';
import type { ITextResourceBindings } from 'src/types';

import { DeleteWarningPopover } from 'altinn-shared/components/molecules/DeleteWarningPopover';
import theme from 'altinn-shared/theme/altinnStudioTheme';
import { getLanguageFromKey } from 'altinn-shared/utils';
import type { ILanguage, ITextResource } from 'altinn-shared/types';

export interface IMobileTableItem {
  key: React.Key;
  label: React.ReactNode;
  value: string;
}

export interface IAltinnMobileTableItemProps {
  items: IMobileTableItem[];
  tableItemIndex: number;
  container?: ILayoutGroup;
  textResources?: ITextResource[];
  language?: ILanguage;
  valid?: boolean;
  editIndex: number;
  onEditClick: () => void;
  getEditButtonText?: (
    language: ILanguage,
    isEditing: boolean,
    textResources: ITextResource[],
    textResourceBindings?: ITextResourceBindings,
  ) => string;
  editButtonText?: string;
  deleteFunctionality?: {
    deleteButtonText: string;
    popoverOpen: boolean;
    popoverPanelIndex: number;
    onDeleteClick: () => void;
    setPopoverOpen: (open: boolean) => void;
    onOpenChange: (index: number) => void;
    onPopoverDeleteClick: (index: number) => () => void;
  };
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
  editButtonCell: {
    width: '185px',
    padding: '4px !important',
    '@media (max-width: 768px)': {
      width: '50px',
    },
  },
  deleteButtonCell: {
    width: '120px',
    padding: '4px !important',
    '@media (max-width: 768px)': {
      width: '50px',
    },
  },
  tableButtonWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'right',
  },
  textContainer: {
    width: '100%',
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  editingRow: {
    backgroundColor: theme.palette.secondary.transparentBlue,
    borderTop: `2px dotted ${theme.altinnPalette.primary.blueMedium}`,
    marginTop: '-1px',
    borderBottom: 0,
    boxSizing: 'border-box',
    '& tbody': {
      backgroundColor: theme.palette.secondary.transparentBlue,
    },
  },
  aboveEditingRow: {
    borderBottom: 0,
  },
  popoverCurrentCell: {
    zIndex: 1,
    position: 'relative',
  },
});

export default function AltinnMobileTableItem({
  items,
  tableItemIndex,
  container,
  textResources,
  valid = true,
  editIndex,
  language,
  onEditClick,
  getEditButtonText,
  editButtonText,
  deleteFunctionality,
}: IAltinnMobileTableItemProps) {
  const classes = useStyles();
  const mobileViewSmall = useMediaQuery('(max-width:768px)');

  const {
    onDeleteClick,
    deleteButtonText,
    popoverOpen,
    popoverPanelIndex,
    setPopoverOpen,
    onPopoverDeleteClick,
    onOpenChange,
  } = deleteFunctionality || {};

  const textResourceBindings = useExpressions(container?.textResourceBindings, {
    forComponentId: container?.id,
    rowIndex: tableItemIndex,
  });

  const edit = useExpressions(container?.edit, {
    forComponentId: container?.id,
    rowIndex: tableItemIndex,
    defaults: ExprDefaultsForGroup.edit,
  });

  if (textResources && getEditButtonText && container && language) {
    const editButtonTextFromTextResources = !valid
      ? getLanguageFromKey('general.edit_alt_error', language)
      : getEditButtonText(language, editIndex === tableItemIndex, textResources, textResourceBindings);

    if (!editButtonText) {
      editButtonText = editButtonTextFromTextResources;
    }
  }

  return (
    <TableContainer
      component={Grid}
      className={cn(
        classes.tableContainer,
        {
          [classes.tableRowError]: !valid,
        },
        {
          [classes.editingRow]: tableItemIndex === editIndex,
        },
        {
          [classes.aboveEditingRow]: tableItemIndex === editIndex - 1,
        },
      )}
    >
      <Table className={classes.table}>
        <TableBody>
          {items.map((item, index) => {
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
                <TableCell
                  className={classes.editButtonCell}
                  align='right'
                >
                  {index == 0 && (
                    <div className={classes.tableButtonWrapper}>
                      <Button
                        data-testid='edit-button'
                        variant={ButtonVariant.Quiet}
                        color={ButtonColor.Secondary}
                        icon={valid ? <EditIcon aria-hidden='true' /> : <WarningIcon aria-hidden='true' />}
                        iconPlacement={!mobileViewSmall ? 'right' : 'left'}
                        onClick={onEditClick}
                        aria-label={`${editButtonText}-${item.value}`}
                      >
                        {!mobileViewSmall && editButtonText}
                      </Button>
                    </div>
                  )}
                </TableCell>
                {edit?.deleteButton !== false &&
                  setPopoverOpen &&
                  onOpenChange &&
                  onPopoverDeleteClick &&
                  language &&
                  typeof popoverOpen === 'boolean' && (
                    <TableCell
                      align='right'
                      className={cn([classes.deleteButtonCell], {
                        [classes.popoverCurrentCell]: tableItemIndex == popoverPanelIndex,
                      })}
                    >
                      {index == 0 && (
                        <div className={classes.tableButtonWrapper}>
                          <DeleteWarningPopover
                            trigger={
                              <Button
                                data-testid='delete-button'
                                variant={ButtonVariant.Quiet}
                                color={ButtonColor.Danger}
                                icon={<DeleteIcon aria-hidden='true' />}
                                iconPlacement={!mobileViewSmall ? 'right' : 'left'}
                                onClick={onDeleteClick}
                                aria-label={`${deleteButtonText}-${item.value}`}
                              >
                                {!mobileViewSmall && deleteButtonText}
                              </Button>
                            }
                            language={language}
                            deleteButtonText={getLanguageFromKey('group.row_popover_delete_button_confirm', language)}
                            messageText={getLanguageFromKey('group.row_popover_delete_message', language)}
                            open={popoverPanelIndex == tableItemIndex && popoverOpen}
                            setPopoverOpen={setPopoverOpen}
                            onCancelClick={() => onOpenChange(tableItemIndex)}
                            onPopoverDeleteClick={onPopoverDeleteClick(tableItemIndex)}
                          />
                        </div>
                      )}
                    </TableCell>
                  )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
