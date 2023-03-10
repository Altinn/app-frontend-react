import React from 'react';

import { TableCell, TableRow } from '@altinn/altinn-design-system';
import { Button, ButtonColor, ButtonVariant } from '@digdir/design-system-react';
import { createTheme, makeStyles, useMediaQuery } from '@material-ui/core';
import { Delete as DeleteIcon, Edit as EditIcon, ErrorColored as ErrorIcon } from '@navikt/ds-icons';
import cn from 'classnames';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { DeleteWarningPopover } from 'src/components/molecules/DeleteWarningPopover';
import { getLanguageFromKey, getTextResourceByKey } from 'src/language/sharedLanguage';
import { FormComponent } from 'src/layout/LayoutComponent';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';
import { getTextAlignment, getTextResource } from 'src/utils/formComponentUtils';
import { useResolvedNode } from 'src/utils/layout/ExprContext';
import type { ExprResolved } from 'src/features/expressions/types';
import type { ILayoutGroup } from 'src/layout/Group/types';
import type { ITextResource, ITextResourceBindings } from 'src/types';
import type { ILanguage } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/hierarchy';

export interface IRepeatingGroupTableRowProps {
  id: string;
  className?: string;
  editIndex: number;
  setEditIndex: (index: number, forceValidation?: boolean) => void;
  onClickRemove: (groupIndex: number) => void;
  deleting: boolean;
  index: number;
  rowHasErrors: boolean;
  getTableNodes: (index: number) => LayoutNode[] | undefined;
  onEditClick: () => void;
  mobileView: boolean;
  deleteFunctionality?: {
    popoverOpen: boolean;
    popoverPanelIndex: number;
    onDeleteClick: () => void;
    setPopoverOpen: (open: boolean) => void;
    onOpenChange: (index: number) => void;
    onPopoverDeleteClick: (index: number) => () => void;
  };
}

const theme = createTheme(AltinnAppTheme);

const useStyles = makeStyles({
  popoverCurrentCell: {
    zIndex: 1,
    position: 'relative',
  },
  buttonCell: {
    minWidth: 'unset',
    maxWidth: 'unset',
    width: '1px', // Shrinks column width
    '& > div': {
      margin: 0,
    },
  },
  buttonInCellWrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '100%',
  },
  tableRowError: {
    backgroundColor: theme.altinnPalette.primary.redLight,
  },
  tableButton: {
    width: 'max-content', // Stops column from shrinking too much
  },
  contentFormatting: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    lineClamp: 2,
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-word',
  },
});

function getTableTitle(textResourceBindings: ITextResourceBindings) {
  if (textResourceBindings.tableTitle) {
    return textResourceBindings.tableTitle;
  }
  if (textResourceBindings.title) {
    return textResourceBindings.title;
  }
  return '';
}

function getEditButtonText(
  language: ILanguage,
  isEditing: boolean,
  textResources: ITextResource[],
  textResourceBindings?: ITextResourceBindings,
) {
  if (isEditing && textResourceBindings?.edit_button_close) {
    return getTextResourceByKey(textResourceBindings?.edit_button_close, textResources);
  } else if (!isEditing && textResourceBindings?.edit_button_open) {
    return getTextResourceByKey(textResourceBindings?.edit_button_open, textResources);
  }

  return isEditing
    ? getLanguageFromKey('general.save_and_close', language)
    : getLanguageFromKey('general.edit_alt', language);
}

export function RepeatingGroupTableRow({
  id,
  className,
  editIndex,
  deleting,
  index,
  rowHasErrors,
  getTableNodes,
  onEditClick,
  mobileView,
  deleteFunctionality,
}: IRepeatingGroupTableRowProps): JSX.Element | null {
  const classes = useStyles();
  const mobileViewSmall = useMediaQuery('(max-width:768px)');
  const textResources = useAppSelector((state) => state.textResources.resources);
  const language = useAppSelector((state) => state.language.language);

  const { popoverOpen, popoverPanelIndex, onDeleteClick, setPopoverOpen, onPopoverDeleteClick, onOpenChange } =
    deleteFunctionality || {};

  const node = useResolvedNode(id);
  const group = node?.item.type === 'Group' && 'rows' in node.item ? node.item : undefined;
  const row = group?.rows[index] ? group.rows[index] : undefined;
  const expressionsForRow = row && row.groupExpressions;
  const edit = {
    ...group?.edit,
    ...expressionsForRow?.edit,
  } as ExprResolved<ILayoutGroup['edit']>;
  const resolvedTextBindings = {
    ...group?.textResourceBindings,
    ...expressionsForRow?.textResourceBindings,
  } as ExprResolved<ILayoutGroup['textResourceBindings']>;

  const tableNodes = getTableNodes(index) || [];
  const displayData = tableNodes.map((node) => {
    const component = node.getComponent();
    return component instanceof FormComponent ? component.useDisplayData(node as any) : '';
  });
  const firstCellData = displayData.find((c) => !!c);

  if (!language) {
    return null;
  }

  const isEditingRow = index === editIndex;

  const editButtonText = rowHasErrors
    ? getLanguageFromKey('general.edit_alt_error', language)
    : getEditButtonText(language, editIndex === index, textResources, resolvedTextBindings);

  const deleteButtonText = getLanguageFromKey('general.delete', language);

  return (
    <TableRow
      key={`repeating-group-row-${index}`}
      className={cn(
        {
          [classes.tableRowError]: rowHasErrors,
        },
        className,
      )}
    >
      {!mobileView ? (
        tableNodes.map((n, idx) => (
          <TableCell
            key={`${n.item.id}-${index}`}
            style={{ textAlign: getTextAlignment(n.item) }}
          >
            <span className={classes.contentFormatting}>{isEditingRow ? null : displayData[idx]}</span>
          </TableCell>
        ))
      ) : (
        <TableCell>
          {tableNodes.map((n, i, { length }) => {
            return (
              !isEditingRow && (
                <React.Fragment key={`${n.item.id}-${index}`}>
                  <b className={classes.contentFormatting}>
                    {getTextResource(getTableTitle(n.item.textResourceBindings || {}), textResources)}:
                  </b>
                  <span className={classes.contentFormatting}>{displayData[i]}</span>
                  {i < length - 1 && <div style={{ height: 8 }} />}
                </React.Fragment>
              )
            );
          })}
        </TableCell>
      )}
      {!mobileView ? (
        <>
          <TableCell
            key={`edit-${index}`}
            className={classes.buttonCell}
            colSpan={edit?.deleteButton === false ? 2 : 1}
          >
            <div className={classes.buttonInCellWrapper}>
              <Button
                aria-expanded={isEditingRow}
                aria-controls={isEditingRow ? `group-edit-container-${id}-${index}` : undefined}
                variant={ButtonVariant.Quiet}
                color={ButtonColor.Secondary}
                icon={rowHasErrors ? <ErrorIcon aria-hidden='true' /> : <EditIcon aria-hidden='true' />}
                iconPlacement='right'
                onClick={onEditClick}
                aria-label={`${editButtonText} ${firstCellData}`}
                data-testid='edit-button'
                className={classes.tableButton}
              >
                {editButtonText}
              </Button>
            </div>
          </TableCell>
          {edit?.deleteButton !== false &&
            setPopoverOpen &&
            onOpenChange &&
            onPopoverDeleteClick &&
            typeof popoverOpen === 'boolean' && (
              <TableCell
                key={`delete-${index}`}
                className={cn(
                  {
                    [classes.popoverCurrentCell]: index == popoverPanelIndex,
                  },
                  classes.buttonCell,
                )}
              >
                <div className={classes.buttonInCellWrapper}>
                  {(() => {
                    const deleteButton = (
                      <Button
                        variant={ButtonVariant.Quiet}
                        color={ButtonColor.Danger}
                        icon={<DeleteIcon aria-hidden='true' />}
                        iconPlacement='right'
                        disabled={deleting}
                        onClick={onDeleteClick}
                        aria-label={`${deleteButtonText}-${firstCellData}`}
                        data-testid='delete-button'
                        className={classes.tableButton}
                      >
                        {deleteButtonText}
                      </Button>
                    );

                    if (edit?.alertOnDelete) {
                      return (
                        <DeleteWarningPopover
                          trigger={deleteButton}
                          side='left'
                          language={language}
                          deleteButtonText={getLanguageFromKey('group.row_popover_delete_button_confirm', language)}
                          messageText={getLanguageFromKey('group.row_popover_delete_message', language)}
                          open={popoverPanelIndex == index && popoverOpen}
                          setPopoverOpen={setPopoverOpen}
                          onCancelClick={() => onOpenChange(index)}
                          onPopoverDeleteClick={onPopoverDeleteClick(index)}
                        />
                      );
                    } else {
                      return deleteButton;
                    }
                  })()}
                </div>
              </TableCell>
            )}
        </>
      ) : (
        <TableCell
          className={classes.buttonCell}
          style={{ verticalAlign: 'top' }}
        >
          <div className={classes.buttonInCellWrapper}>
            <Button
              aria-expanded={isEditingRow}
              aria-controls={isEditingRow ? `group-edit-container-${id}-${index}` : undefined}
              variant={ButtonVariant.Quiet}
              color={ButtonColor.Secondary}
              icon={rowHasErrors ? <ErrorIcon aria-hidden='true' /> : <EditIcon aria-hidden='true' />}
              iconPlacement='right'
              onClick={onEditClick}
              aria-label={`${editButtonText} ${firstCellData}`}
              data-testid='edit-button'
              className={classes.tableButton}
            >
              {(isEditingRow || !mobileViewSmall) && editButtonText}
            </Button>
            {edit?.deleteButton !== false &&
              setPopoverOpen &&
              onOpenChange &&
              onPopoverDeleteClick &&
              typeof popoverOpen === 'boolean' && (
                <>
                  <div style={{ height: 8 }} />
                  {(() => {
                    const deleteButton = (
                      <Button
                        variant={ButtonVariant.Quiet}
                        color={ButtonColor.Danger}
                        icon={<DeleteIcon aria-hidden='true' />}
                        iconPlacement='right'
                        disabled={deleting}
                        onClick={onDeleteClick}
                        aria-label={`${deleteButtonText}-${firstCellData}`}
                        data-testid='delete-button'
                        className={classes.tableButton}
                      >
                        {(isEditingRow || !mobileViewSmall) && deleteButtonText}
                      </Button>
                    );

                    if (edit?.alertOnDelete) {
                      return (
                        <DeleteWarningPopover
                          trigger={deleteButton}
                          side='left'
                          language={language}
                          deleteButtonText={getLanguageFromKey('group.row_popover_delete_button_confirm', language)}
                          messageText={getLanguageFromKey('group.row_popover_delete_message', language)}
                          open={popoverPanelIndex == index && popoverOpen}
                          setPopoverOpen={setPopoverOpen}
                          onCancelClick={() => onOpenChange(index)}
                          onPopoverDeleteClick={onPopoverDeleteClick(index)}
                        />
                      );
                    } else {
                      return deleteButton;
                    }
                  })()}
                </>
              )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
