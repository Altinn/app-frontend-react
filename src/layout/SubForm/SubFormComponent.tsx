import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Spinner, Table } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@navikt/ds-icons';
import dot from 'dot-object';

import { Caption } from 'src/components/form/Caption';
import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useStrictInstanceData } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { useAddEntryMutation, useDeleteEntryMutation } from 'src/features/subFormData/useSubFormMutations';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/SubForm/SubFormComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { getDataModelUrl } from 'src/utils/urls/appUrlHelper';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function SubFormComponent({ node }: PropsFromGenericComponent<'SubForm'>): React.JSX.Element | null {
  const {
    id,
    layoutSet,
    textResourceBindings,
    tableColumns = [],
    showAddButton = true,
    showDeleteButton = true,
  } = useNodeItem(node);

  const isSubFormPage = useNavigationParam('isSubFormPage');
  if (isSubFormPage) {
    window.logErrorOnce('Cannot use a SubFormComponent component within a subform');
    throw new Error('Cannot use a SubFormComponent component within a subform');
  }

  const dataType = useDataTypeFromLayoutSet(layoutSet);

  if (!dataType) {
    window.logErrorOnce(`Unable to find data type for subform with id ${id}`);
    throw new Error(`Unable to find data type for subform with id ${id}`);
  }

  const { langAsString } = useLanguage();
  const addEntryMutation = useAddEntryMutation(dataType);
  const instanceData = useStrictInstanceData();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const dataElements = instanceData.data.filter((d) => d.dataType === dataType) ?? [];
  const [subFormEntries, updateSubFormEntries] = useState(dataElements);

  const addEntry = async () => {
    setIsAdding(true);

    try {
      const result = await addEntryMutation.mutateAsync({});
      navigate(`${node.id}/${result.id}`);
    } catch {
      // NOTE: Handled by useAddEntryMutation
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <ComponentStructureWrapper node={node}>
      <Grid
        id={node.id}
        container={true}
        item={true}
        data-componentid={node.id}
        data-componentbaseid={node.baseId}
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
          {subFormEntries.length > 0 && (
            <>
              <Table.Head id={`subform-${id}-table-body`}>
                <Table.Row>
                  {tableColumns.length ? (
                    tableColumns.map((entry, index) => (
                      <Table.HeaderCell
                        className={classes.tableCellFormatting}
                        key={index}
                      >
                        <Lang id={entry.headerContent} />
                      </Table.HeaderCell>
                    ))
                  ) : (
                    <Table.HeaderCell className={classes.tableCellFormatting}>
                      <Lang id={'form_filler.subform_default_header'} />
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
            </>
          )}
        </Table>

        {showAddButton && (
          <div className={classes.addButton}>
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
          </div>
        )}
      </Grid>
    </ComponentStructureWrapper>
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
  const { tableColumns = [] } = useNodeItem(node);
  const instance = useStrictInstanceData();
  const url = getDataModelUrl(instance.id, id, true);
  const { isFetching, data, error, failureCount } = useFormDataQuery(url);
  const { langAsString } = useLanguage();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteEntryMutation = useDeleteEntryMutation(id);
  const deleteButtonText = langAsString('general.delete');
  const editButtonText = langAsString('general.edit');

  const numColumns = tableColumns.length;
  const actualColumns = showDeleteButton ? numColumns + 1 : numColumns;

  if (isFetching) {
    return (
      <Table.Row>
        <Table.Cell colSpan={actualColumns}>
          <Spinner title={langAsString('general.loading')} />
        </Table.Cell>
      </Table.Row>
    );
  } else if (error) {
    console.error(`Error loading data element ${id} from server. Gave up after ${failureCount} attempt(s).`, error);
    return (
      <Table.Row>
        <Table.Cell colSpan={actualColumns}>
          <Lang id='form_filler.error_fetch_subform' />
        </Table.Cell>
      </Table.Row>
    );
  }

  const deleteEntry = async () => {
    setIsDeleting(true);

    try {
      await deleteEntryMutation.mutateAsync(id);
      deleteEntryCallback(dataElement);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <Table.Row
      key={`subform-row-${id}`}
      data-row-num={rowNumber}
      className={isDeleting ? classes.disabledRow : ''}
    >
      {tableColumns.length ? (
        tableColumns.map((entry, index) => (
          <Table.Cell key={`subform-cell-${id}-${index}`}>
            <DataQueryWithDefaultValue
              data={data}
              query={entry.cellContent.query}
              defaultValue={entry.cellContent.default}
            />
          </Table.Cell>
        ))
      ) : (
        <Table.Cell key={`subform-cell-${id}-0`}>{String(id)}</Table.Cell>
      )}
      <Table.Cell className={classes.buttonCell}>
        <div className={classes.buttonInCellWrapper}>
          <Button
            disabled={isDeleting}
            variant='tertiary'
            color='second'
            size='small'
            onClick={async () => navigate(`${node.id}/${id}`)}
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

export interface DataQueryParams {
  data: unknown;
  query: string;
  defaultValue?: string;
}

export function DataQueryWithDefaultValue(props: DataQueryParams) {
  const { data, query, defaultValue } = props;
  const { langAsString } = useLanguage();
  let content = dot.pick(query, data);

  if (!content && defaultValue != undefined) {
    const textLookup = langAsString(defaultValue);
    content = textLookup ? textLookup : defaultValue;
  }

  if (typeof content === 'object' || content === undefined || content === null) {
    return null;
  }

  return <>{String(content)}</>;
}
