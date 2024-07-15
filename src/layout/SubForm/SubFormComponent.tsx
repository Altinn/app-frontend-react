import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Spinner, Table } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@navikt/ds-icons';
import dot from 'dot-object';

import { Caption } from 'src/components/form/Caption';
import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useStrictInstanceData } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useAddEntryMutation, useDeleteEntryMutation } from 'src/features/subFormData/useSubFormMutations';
import classes from 'src/layout/SubForm/SubFormComponent.module.css';
import { getDataModelUrl } from 'src/utils/urls/appUrlHelper';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function SubFormComponent({ node }: PropsFromGenericComponent<'SubForm'>): React.JSX.Element | null {
  const {
    dataType,
    id,
    textResourceBindings,
    tableColumns = [],
    showAddButton = true,
    showDeleteButton = true,
  } = node.item;
  const { langAsString } = useLanguage();
  const addEntryMutation = useAddEntryMutation(dataType);
  const instanceData = useStrictInstanceData();
  const [isAdding, setIsAdding] = useState(false);

  const dataElements = instanceData.data.filter((d) => d.dataType === dataType) ?? [];
  const [subFormEntries, updateSubFormEntries] = useState(dataElements);
  const haveTableColumns = tableColumns.length > 0;

  const addEntry = async () => {
    setIsAdding(true);

    const result = await addEntryMutation.mutateAsync({});
    updateSubFormEntries([...subFormEntries, result.reply]);

    setIsAdding(false);
  };

  return (
    <Grid
      container={true}
      item={true}
      data-componentid={node.item.id}
      data-componentbaseid={node.item.baseComponentId || node.item.id}
    >
      <Table
        id={`subform-${id}-table`}
        className={classes.subFormTable}
      >
        <Caption
          id={`subform-${id}-caption`}
          title={<Lang id={textResourceBindings?.title} />}
          description={textResourceBindings?.description && <Lang id={textResourceBindings?.description} />}
        />
        <Table.Head id={`subform-${id}-table-body`}>
          <Table.Row>
            {haveTableColumns &&
              tableColumns.map((entry, index) => (
                <Table.HeaderCell
                  className={classes.tableCellFormatting}
                  key={index}
                >
                  <Lang id={entry.headerContent} />
                </Table.HeaderCell>
              ))}
            {!haveTableColumns && (
              <Table.HeaderCell className={classes.tableCellFormatting}>
                <Lang id={langAsString('form_filler.sub_form_default_header')} />
              </Table.HeaderCell>
            )}
            <Table.HeaderCell>
              <span className={classes.visuallyHidden}>
                <Lang id={'general.edit'} />
              </span>
            </Table.HeaderCell>
            {showDeleteButton && (
              <Table.HeaderCell>
                <span className={classes.visuallyHidden}>
                  <Lang id={'general.delete'} />
                </span>
              </Table.HeaderCell>
            )}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {subFormEntries.map((dataElement, index) => (
            <SubFormTableRow
              key={dataElement.id}
              dataElement={dataElement}
              node={node}
              rowNumber={index}
              showDeleteButton={showDeleteButton}
              deleteEntryCallback={(d) => {
                const items = subFormEntries.filter((x) => x.id != d.id);
                updateSubFormEntries([...items]);
              }}
            />
          ))}
        </Table.Body>
      </Table>
      {showAddButton && (
        <Button
          disabled={isAdding}
          id={`subform-${id}-add-button`}
          onClick={async () => await addEntry()}
          onKeyUp={async (event: React.KeyboardEvent<HTMLButtonElement>) => {
            const allowedKeys = ['enter', ' ', 'spacebar'];
            if (allowedKeys.includes(event.key.toLowerCase())) {
              await addEntry();
            }
          }}
          variant='secondary'
          fullWidth
        >
          <AddIcon
            fontSize='1.5rem'
            aria-hidden='true'
          />
          {langAsString(textResourceBindings?.addButton)}
        </Button>
      )}
    </Grid>
  );
}

function SubFormTableRow({
  dataElement,
  node,
  rowNumber,
  showDeleteButton,
  deleteEntryCallback,
}: {
  dataElement: IData;
  node: LayoutNode<'SubForm'>;
  rowNumber: number;
  showDeleteButton: boolean;
  deleteEntryCallback: (dataElement: IData) => void;
}) {
  const id = dataElement.id;
  const { tableColumns = [] } = node.item;
  const instance = useStrictInstanceData();
  const url = getDataModelUrl(instance.id, id, true);
  const { isFetching, data } = useFormDataQuery(url);
  const { langAsString } = useLanguage();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteEntryMutation = useDeleteEntryMutation(id);
  const deleteButtonText = langAsString('general.delete');
  const editButtonText = langAsString('general.edit');
  const haveTableColumns = tableColumns.length > 0;

  if (isFetching) {
    const numColumns = tableColumns.length;
    const actualColumns = showDeleteButton ? numColumns + 1 : numColumns;
    return (
      <Table.Row>
        <Table.Cell colSpan={actualColumns}>
          <Spinner title={langAsString('general.loading')} />
        </Table.Cell>
      </Table.Row>
    );
  }

  const deleteEntry = async () => {
    setIsDeleting(true);

    await deleteEntryMutation.mutateAsync(id);
    deleteEntryCallback(dataElement);
  };

  return (
    <Table.Row
      key={`subform-row-${id}`}
      data-row-num={rowNumber}
      className={isDeleting ? classes.disabledRow : ''}
    >
      {haveTableColumns &&
        tableColumns.map((entry, index) => {
          const content = dot.pick(entry.cellContent, data) ?? langAsString(entry.cellContent);
          return <Table.Cell key={`subform-cell-${id}-${index}`}>{String(content)}</Table.Cell>;
        })}
      {!haveTableColumns && <Table.Cell key={`subform-cell-${id}-0`}>{String(id)}</Table.Cell>}
      <Table.Cell className={classes.buttonCell}>
        <div className={classes.buttonInCellWrapper}>
          <Button
            disabled={isDeleting}
            variant='tertiary'
            color='second'
            size='small'
            onClick={async () => navigate(`${node.item.id}/${id}`)}
            aria-label={editButtonText}
            data-testid='edit-button'
            className={classes.tableButton}
          >
            {editButtonText}
            <EditIcon
              fontSize='1rem'
              aria-hidden='true'
            />
          </Button>
        </div>
      </Table.Cell>
      {showDeleteButton && (
        <Table.Cell className={classes.buttonCell}>
          <div className={classes.buttonInCellWrapper}>
            <Button
              disabled={isDeleting}
              variant='tertiary'
              color='danger'
              size='small'
              onClick={async () => await deleteEntry()}
              aria-label={deleteButtonText}
              data-testid='delete-button'
              className={classes.tableButton}
            >
              {deleteButtonText}
              <DeleteIcon
                fontSize='1rem'
                aria-hidden='true'
              />
            </Button>
          </div>
        </Table.Cell>
      )}
    </Table.Row>
  );
}