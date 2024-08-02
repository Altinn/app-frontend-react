import React from 'react';

import { Spinner, Table } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';
import dot from 'dot-object';

import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useStrictInstanceData } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/layout/SubForm/SubFormComponent.module.css';
import { getDataModelUrl } from 'src/utils/urls/appUrlHelper';
import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ISubFormSummaryComponent {
  targetNode: LayoutNode<'SubForm'>;
}

export function SubFormSummaryComponent({ targetNode }: ISubFormSummaryComponent): React.JSX.Element | null {
  const { dataType, id, textResourceBindings, tableColumns = [] } = targetNode.item;
  const dataElements = useStrictInstanceData().data.filter((d) => d.dataType === dataType) ?? [];

  return (
    <Grid
      container={true}
      item={true}
      data-componentid={targetNode.item.id}
      data-componentbaseid={targetNode.item.baseComponentId || targetNode.item.id}
    >
      <Table
        id={`subform-${id}-table-summary`}
        // className={classes.subFormTable}
      >
        {dataElements.length ? (
          <>
            {/* <Table.Head id={`subform-${id}-table-body-summary`}>
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
                    <Lang id={'form_filler.sub_form_default_header'} />
                  </Table.HeaderCell>
                )}
              </Table.Row>
            </Table.Head> */}
            <Table.Body>
              {dataElements.map((dataElement, index) => (
                <SubFormTableRow
                  key={dataElement.id}
                  dataElement={dataElement}
                  node={targetNode}
                  rowNumber={index}
                />
              ))}
            </Table.Body>
          </>
        ) : (
          <span className={classes.emptyField}>
            <Lang id={'general.empty_summary'} />
          </span>
        )}
      </Table>
    </Grid>
  );
}

function SubFormTableRow({
  dataElement,
  node,
  rowNumber,
}: {
  dataElement: IData;
  node: LayoutNode<'SubForm'>;
  rowNumber: number;
}) {
  const id = dataElement.id;
  const { tableColumns = [] } = node.item;
  const instance = useStrictInstanceData();
  const url = getDataModelUrl(instance.id, id, true);
  const { isFetching, data } = useFormDataQuery(url);
  const { langAsString } = useLanguage();

  if (isFetching) {
    return (
      <Table.Row>
        <Table.Cell colSpan={tableColumns.length}>
          <Spinner title={langAsString('general.loading')} />
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
        tableColumns.map((entry, index) => {
          const content = dot.pick(entry.cellContent, data);
          return (
            <Table.Cell
              key={`subform-cell-${id}-${index}-summary`}
            >{`${langAsString(entry.headerContent)}: ${content}`}</Table.Cell>
          );
        })
      ) : (
        <Table.Cell key={`subform-cell-${id}-0-summary`}>{String(id)}</Table.Cell>
      )}
    </Table.Row>
  );
}
