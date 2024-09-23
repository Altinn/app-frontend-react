import React from 'react';

import { Spinner, Table } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';
import dot from 'dot-object';

import { Caption } from 'src/components/form/Caption';
import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useStrictInstanceData } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/Subform/SubformComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { getStatefulDataModelUrl } from 'src/utils/urls/appUrlHelper';
import type { ISubformSummaryComponent } from 'src/layout/Subform/Summary/SubformSummaryComponent';
import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

function SubformTableRow({
  dataElement,
  targetNode,
  rowNumber,
}: {
  dataElement: IData;
  targetNode: LayoutNode<'Subform'>;
  rowNumber: number;
}) {
  const id = dataElement.id;
  const { tableColumns = [] } = useNodeItem(targetNode);
  const instance = useStrictInstanceData();
  const url = getStatefulDataModelUrl(instance.id, id, true);
  const { isFetching, data, error } = useFormDataQuery(url);
  const { langAsString } = useLanguage();

  const numColumns = tableColumns.length;
  if (isFetching) {
    return (
      <Table.Row>
        <Table.Cell colSpan={numColumns}>
          <Spinner title={langAsString('general.loading')} />
        </Table.Cell>
      </Table.Row>
    );
  } else if (error) {
    return (
      <Table.Row>
        <Table.Cell colSpan={numColumns}>
          <Lang id='form_filler.error_fetch_subform' />
        </Table.Cell>
      </Table.Row>
    );
  }
  return (
    <Table.Row
      key={`subform-row-${id}`}
      data-row-num={rowNumber}
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

export function SubformSummaryTable({ targetNode }: ISubformSummaryComponent): React.JSX.Element | null {
  const { id, layoutSet, textResourceBindings, tableColumns = [] } = useNodeItem(targetNode);

  const isSubformPage = useNavigationParam('isSubformPage');
  if (isSubformPage) {
    window.logErrorOnce('Cannot use a SubformComponent component within a subform');
    throw new Error('Cannot use a SubformComponent component within a subform');
  }

  const dataType = useDataTypeFromLayoutSet(layoutSet);

  if (!dataType) {
    window.logErrorOnce(`Unable to find data type for subform with id ${id}`);
    throw new Error(`Unable to find data type for subform with id ${id}`);
  }

  const instanceData = useStrictInstanceData();
  const dataElements = instanceData.data.filter((d) => d.dataType === dataType) ?? [];

  return (
    <ComponentStructureWrapper node={targetNode}>
      <Grid
        id={targetNode.id}
        container={true}
        item={true}
        data-componentid={targetNode.id}
        data-componentbaseid={targetNode.baseId}
      >
        <Table
          id={`subform-${id}-table`}
          className={classes.subformTable}
        >
          <Caption
            id={`subform-${id}-caption`}
            title={<Lang id={textResourceBindings?.title} />}
            description={textResourceBindings?.description && <Lang id={textResourceBindings?.description} />}
          />
          {dataElements.length > 0 && (
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
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {dataElements.map((dataElement, index) => (
                  <SubformTableRow
                    key={dataElement.id}
                    dataElement={dataElement}
                    targetNode={targetNode}
                    rowNumber={index}
                  />
                ))}
              </Table.Body>
            </>
          )}
        </Table>
      </Grid>
    </ComponentStructureWrapper>
  );
}
