import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, Table } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';
import { Add as AddIcon, Delete as DeleteIcon } from '@navikt/ds-icons';

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
  const { dataType, id, textResourceBindings, showAddButton = true, showDeleteButton = true } = node.item;
  const { langAsString } = useLanguage();
  const addEntryMutation = useAddEntryMutation(dataType);
  const instanceData = useStrictInstanceData();

  const dataElements = instanceData.data.filter((d) => d.dataType === dataType) ?? [];
  const [subFormEntries, updateSubFormEntries] = useState(dataElements);

  const addEntry = async () => {
    try {
      const result = await addEntryMutation.mutateAsync({});
      updateSubFormEntries([...subFormEntries, result.reply]);
    } catch (error) {
      console.error('Error adding entry:', error);
    }
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
        className={classes.repeatingGroupTable}
      >
        <Caption
          id={`subform-${id}-caption`}
          title={<Lang id={textResourceBindings?.title} />}
          description={textResourceBindings?.description && <Lang id={textResourceBindings?.description} />}
        />
        <Table.Head id={`subform-${id}-table-body`}>
          <Table.Row>
            <Table.HeaderCell className={classes.tableCellFormatting}>
              <Lang id={'Oppføringer'} />
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
  const instance = useStrictInstanceData();
  const url = getDataModelUrl(instance.id, id, true);
  const { isFetching } = useFormDataQuery(url);
  const { langAsString } = useLanguage();

  const deleteEntryMutation = useDeleteEntryMutation(id);
  const deleteButtonText = langAsString('general.delete');

  if (isFetching) {
    // TODO: Spinner
    return null;
  }
  // <span>{dot.pick('Path.Inside.DataModel', data)}</span>

  const deleteEntry = async () => {
    try {
      await deleteEntryMutation.mutateAsync(id);
      deleteEntryCallback(dataElement);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <Table.Row
      key={`repeating-group-row-${id}`}
      data-row-num={rowNumber}
    >
      <Table.Cell key={id}>
        <Link to={`${node.item.id}/${id}`}>{id}</Link>
      </Table.Cell>
      {showDeleteButton && (
        <Table.Cell className={classes.buttonCell}>
          <div className={classes.buttonInCellWrapper}>
            <Button
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
