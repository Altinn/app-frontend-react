import React from 'react';

import { Button, Table } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';
import { Delete as DeleteIcon, Edit as EditIcon, ErrorColored as ErrorIcon } from '@navikt/ds-icons';
import cn from 'classnames';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { DeleteWarningPopover } from 'src/components/molecules/DeleteWarningPopover';
import { useDisplayDataProps } from 'src/features/displayData/useDisplayData';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useDeepValidationsForNode } from 'src/features/validation/selectors/deepValidationsForNode';
import { hasValidationErrors } from 'src/features/validation/utils';
import { useAlertOnChange } from 'src/hooks/useAlertOnChange';
import { useIsMobile } from 'src/hooks/useIsMobile';
import { implementsDisplayData } from 'src/layout';
import { GenericComponent } from 'src/layout/GenericComponent';
import classes from 'src/layout/RepeatingGroup/RepeatingGroup.module.css';
import { useRepeatingGroup } from 'src/layout/RepeatingGroup/RepeatingGroupContext';
import { useRepeatingGroupsFocusContext } from 'src/layout/RepeatingGroup/RepeatingGroupFocusContext';
import { getColumnStylesRepeatingGroups } from 'src/utils/formComponentUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { AlertOnChange } from 'src/hooks/useAlertOnChange';
import type { CompInternal, ITextResourceBindings } from 'src/layout/layout';
import type { AnyComponent } from 'src/layout/LayoutComponent';
import type { CompRepeatingGroupExternal } from 'src/layout/RepeatingGroup/config.generated';
import type { GroupExpressions } from 'src/layout/RepeatingGroup/types';
import type { ChildLookupRestriction } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IRepeatingGroupTableRowProps {
  className?: string;
  uuid: string;
  getTableNodes: (restriction: ChildLookupRestriction) => LayoutNode[] | undefined;
  mobileView: boolean;
  displayEditColumn: boolean;
  displayDeleteColumn: boolean;
}

function getTableTitle(textResourceBindings: ITextResourceBindings) {
  if (!textResourceBindings) {
    return '';
  }

  if ('tableTitle' in textResourceBindings) {
    return textResourceBindings.tableTitle;
  }

  if ('title' in textResourceBindings) {
    return textResourceBindings.title;
  }

  return '';
}

function getEditButtonText(
  isEditing: boolean,
  langTools: IUseLanguage,
  textResourceBindings: GroupExpressions['textResourceBindings'] | undefined,
) {
  const buttonTextKey = isEditing
    ? textResourceBindings?.edit_button_close
      ? textResourceBindings?.edit_button_close
      : 'general.save_and_close'
    : textResourceBindings?.edit_button_open
      ? textResourceBindings?.edit_button_open
      : 'general.edit_alt';
  return langTools.langAsString(buttonTextKey);
}

export function RepeatingGroupTableRow({
  className,
  uuid,
  getTableNodes,
  mobileView,
  displayEditColumn,
  displayDeleteColumn,
}: IRepeatingGroupTableRowProps): JSX.Element | null {
  const mobileViewSmall = useIsMobile();
  const { refSetter } = useRepeatingGroupsFocusContext();

  const { node, deleteRow, isEditing, isDeleting, toggleEditing } = useRepeatingGroup();
  const langTools = useLanguage();
  const { langAsString } = langTools;
  const id = node.getId();
  const group = useNodeItem(node);
  const row = group.rows.find((r) => r.uuid === uuid);
  const rowExpressions = row?.groupExpressions;
  const editForRow = rowExpressions?.edit;
  const editForGroup = group.edit;
  const trbForRow = rowExpressions?.textResourceBindings;
  const columnSettings = group.tableColumns;

  const rowValidations = useDeepValidationsForNode(node, true, uuid);
  const rowHasErrors = hasValidationErrors(rowValidations);

  const alertOnDelete = useAlertOnChange(Boolean(editForRow?.alertOnDelete), deleteRow);

  const tableNodes = getTableNodes({ onlyInRowUuid: uuid }) || [];
  const displayDataProps = useDisplayDataProps();
  const displayData = tableNodes.map((node) => {
    const def = node.def as AnyComponent<any>;
    if (!implementsDisplayData(def)) {
      return '';
    }

    return def.getDisplayData(node as any, node.item as any, displayDataProps);
  });
  const firstCellData = displayData.find((c) => !!c);
  const isEditingRow = isEditing(uuid);
  const isDeletingRow = isDeleting(uuid);

  const editButtonText = rowHasErrors
    ? langAsString('general.edit_alt_error')
    : getEditButtonText(isEditingRow, langTools, trbForRow);

  const deleteButtonText = langAsString('general.delete');

  if (!row) {
    return null;
  }

  return (
    <Table.Row
      key={`repeating-group-row-${uuid}`}
      className={cn(
        {
          [classes.tableRowError]: rowHasErrors,
        },
        className,
      )}
      data-row-num={row.index}
    >
      {!mobileView ? (
        tableNodes.map((n, idx) =>
          shouldEditInTable(editForGroup, n, columnSettings) ? (
            <Table.Cell
              key={n.getId()}
              className={classes.tableCell}
            >
              <div ref={(ref) => refSetter && refSetter(row.index, `component-${n.getId()}`, ref)}>
                <GenericComponent
                  node={n}
                  overrideDisplay={{
                    renderedInTable: true,
                    renderLabel: false,
                    renderLegend: false,
                  }}
                  overrideItemProps={{
                    grid: {},
                  }}
                />
              </div>
            </Table.Cell>
          ) : (
            <Table.Cell
              key={`${n.getId()}`}
              className={classes.tableCell}
            >
              <span
                className={classes.contentFormatting}
                style={getColumnStylesRepeatingGroups(n, columnSettings)}
              >
                {isEditingRow ? null : displayData[idx]}
              </span>
            </Table.Cell>
          ),
        )
      ) : (
        <Table.Cell className={classes.mobileTableCell}>
          <Grid
            container={true}
            spacing={3}
          >
            {tableNodes.map(
              (n, i, { length }) =>
                !isEditingRow &&
                (shouldEditInTable(editForGroup, n, columnSettings) ? (
                  <Grid
                    container={true}
                    item={true}
                    key={n.getId()}
                    ref={(ref) => refSetter && refSetter(row.index, `component-${n.getId()}`, ref)}
                  >
                    <GenericComponent
                      node={n}
                      overrideItemProps={{
                        grid: {},
                      }}
                    />
                  </Grid>
                ) : (
                  <Grid
                    container={true}
                    item={true}
                    key={n.getId()}
                  >
                    <b className={cn(classes.contentFormatting, classes.spaceAfterContent)}>
                      <Lang id={getTableTitle('textResourceBindings' in n.item ? n.item.textResourceBindings : {})} />:
                    </b>
                    <span className={classes.contentFormatting}>{displayData[i]}</span>
                    {i < length - 1 && <div style={{ height: 8 }} />}
                  </Grid>
                )),
            )}
          </Grid>
        </Table.Cell>
      )}
      {!mobileView ? (
        <>
          {editForRow?.editButton === false &&
          editForRow?.deleteButton === false &&
          (displayEditColumn || displayDeleteColumn) ? (
            <Table.Cell
              key={`editDelete-${uuid}`}
              colSpan={displayEditColumn && displayDeleteColumn ? 2 : 1}
            />
          ) : null}
          {editForRow?.editButton !== false && displayEditColumn && (
            <Table.Cell
              key={`edit-${uuid}`}
              className={classes.buttonCell}
              colSpan={displayDeleteColumn && editForRow?.deleteButton === false ? 2 : 1}
            >
              <div className={classes.buttonInCellWrapper}>
                <Button
                  aria-expanded={isEditingRow}
                  aria-controls={isEditingRow ? `group-edit-container-${id}-${uuid}` : undefined}
                  variant='tertiary'
                  color='second'
                  size='small'
                  onClick={() => toggleEditing(uuid)}
                  aria-label={`${editButtonText} ${firstCellData}`}
                  data-testid='edit-button'
                  className={classes.tableButton}
                >
                  {editButtonText}
                  {rowHasErrors ? <ErrorIcon aria-hidden='true' /> : <EditIcon aria-hidden='true' />}
                </Button>
              </div>
            </Table.Cell>
          )}
          {editForRow?.deleteButton !== false && displayDeleteColumn && (
            <Table.Cell
              key={`delete-${uuid}`}
              className={cn(classes.buttonCell)}
              colSpan={displayEditColumn && editForRow?.editButton === false ? 2 : 1}
            >
              <div className={classes.buttonInCellWrapper}>
                <DeleteElement
                  uuid={uuid}
                  isDeletingRow={isDeletingRow}
                  editForRow={editForRow}
                  deleteButtonText={deleteButtonText}
                  firstCellData={firstCellData}
                  alertOnDeleteProps={alertOnDelete}
                  langAsString={langAsString}
                >
                  {deleteButtonText}
                </DeleteElement>
              </div>
            </Table.Cell>
          )}
        </>
      ) : (
        <Table.Cell
          className={cn(classes.buttonCell, classes.mobileTableCell)}
          style={{ verticalAlign: 'top' }}
        >
          <div className={classes.buttonInCellWrapper}>
            {editForRow?.editButton !== false && (
              <Button
                aria-expanded={isEditingRow}
                aria-controls={isEditingRow ? `group-edit-container-${id}-${uuid}` : undefined}
                variant='tertiary'
                color='second'
                size='small'
                icon={!isEditingRow && mobileViewSmall}
                onClick={() => toggleEditing(uuid)}
                aria-label={`${editButtonText} ${firstCellData}`}
                data-testid='edit-button'
                className={classes.tableButton}
              >
                {(isEditingRow || !mobileViewSmall) && editButtonText}
                {rowHasErrors ? <ErrorIcon aria-hidden='true' /> : <EditIcon aria-hidden='true' />}
              </Button>
            )}
            {editForRow?.deleteButton !== false && (
              <>
                <div style={{ height: 8 }} />
                <DeleteElement
                  uuid={uuid}
                  isDeletingRow={isDeletingRow}
                  editForRow={editForRow}
                  deleteButtonText={deleteButtonText}
                  firstCellData={firstCellData}
                  alertOnDeleteProps={alertOnDelete}
                  langAsString={langAsString}
                >
                  {isEditingRow || !mobileViewSmall ? deleteButtonText : null}
                </DeleteElement>
              </>
            )}
          </div>
        </Table.Cell>
      )}
    </Table.Row>
  );
}

export function shouldEditInTable(
  groupEdit: CompInternal<'RepeatingGroup'>['edit'],
  tableNode: LayoutNode,
  columnSettings: CompRepeatingGroupExternal['tableColumns'],
) {
  const column = columnSettings && columnSettings[tableNode.getBaseId()];
  if (groupEdit?.mode === 'onlyTable' && column?.editInTable !== false) {
    return tableNode.def.canRenderInTable();
  }

  if (column && column.editInTable) {
    return tableNode.def.canRenderInTable();
  }

  return false;
}

const DeleteElement = ({
  uuid,
  isDeletingRow,
  editForRow,
  deleteButtonText,
  firstCellData,
  langAsString,
  alertOnDeleteProps: { alertOpen, setAlertOpen, confirmChange, cancelChange, handleChange: handleDelete },
  children,
}: {
  uuid: string;
  isDeletingRow: boolean;
  editForRow: GroupExpressions['edit'];
  deleteButtonText: string;
  firstCellData: string | undefined;
  langAsString: (key: string) => string;
  alertOnDeleteProps: AlertOnChange<(uuid: string) => void>;
  children: React.ReactNode;
}) => (
  <ConditionalWrapper
    condition={Boolean(editForRow?.alertOnDelete)}
    wrapper={(children) => (
      <DeleteWarningPopover
        placement='left'
        deleteButtonText={langAsString('group.row_popover_delete_button_confirm')}
        messageText={langAsString('group.row_popover_delete_message')}
        onCancelClick={cancelChange}
        onPopoverDeleteClick={confirmChange}
        open={alertOpen}
        setOpen={setAlertOpen}
      >
        {children}
      </DeleteWarningPopover>
    )}
  >
    <Button
      variant='tertiary'
      color='danger'
      iconPlacement='right'
      size='small'
      disabled={isDeletingRow}
      onClick={() => handleDelete(uuid)}
      aria-label={`${deleteButtonText}-${firstCellData}`}
      data-testid='delete-button'
      icon={!children}
      className={classes.tableButton}
    >
      {children}
      <DeleteIcon aria-hidden='true' />
    </Button>
  </ConditionalWrapper>
);
