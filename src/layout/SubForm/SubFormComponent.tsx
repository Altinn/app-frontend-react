import React from 'react';
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
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function SubFormComponent({ node }: PropsFromGenericComponent<'SubForm'>): React.JSX.Element | null {
  const { dataType, id, textResourceBindings, showAddButton = true, showDeleteButton = true } = node.item;
  const dataElements = useStrictInstanceData().data.filter((d) => d.dataType === dataType);
  const { langAsString } = useLanguage();
  const addEntryMutation = useAddEntryMutation();

  const addEntry = async () => {
    try {
      await addEntryMutation.mutateAsync({
        /* TODO: data */
      });
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
          {dataElements.map((dataElement, index) => (
            <SubFormTableRow
              key={dataElement.id}
              id={dataElement.id}
              node={node}
              rowNumber={index}
              showDeleteButton={showDeleteButton}
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
          {`${langAsString('general.add_new')} ${langAsString(textResourceBindings?.addButton)}`}
        </Button>
      )}
    </Grid>
  );
}

function SubFormTableRow({
  id,
  node,
  rowNumber,
  showDeleteButton,
}: {
  id: string;
  node: LayoutNode<'SubForm'>;
  rowNumber: number;
  showDeleteButton: boolean;
}) {
  const instance = useStrictInstanceData();
  const url = getDataModelUrl(instance.id, id, true);
  const { isFetching, data, error } = useFormDataQuery(url);
  const { langAsString } = useLanguage();

  const deleteEntryMutation = useDeleteEntryMutation(id); // TODO: this should be the id of the sub form
  const deleteButtonText = langAsString('general.delete');

  if (isFetching) {
    // TODO: Spinner
    return null;
  }
  // <span>{dot.pick('Path.Inside.DataModel', data)}</span>

  const deleteEntry = async () => {
    try {
      await deleteEntryMutation.mutateAsync();
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
