import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Spinner, Table } from '@digdir/designsystemet-react';

import { Label } from 'src/components/label/Label';
import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useStrictInstanceData } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { usePdfModeActive } from 'src/features/pdf/PDFWrapper';
import { useIsMobileOrTablet } from 'src/hooks/useIsMobile';
import { dataQueryWithDefaultValue } from 'src/layout/SubForm/SubFormComponent';
import classes from 'src/layout/SubForm/Summary/SubFormSummaryComponent2.module.css';
import { EditButton } from 'src/layout/Summary2/CommonSummaryComponents/EditButton';
import { getDataModelUrl } from 'src/utils/urls/appUrlHelper';
import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ISubFormSummaryComponent {
  targetNode: LayoutNode<'SubForm'>;
}

export function SubFormSummaryComponent2({ targetNode }: ISubFormSummaryComponent): React.JSX.Element | null {
  const { dataType, id, textResourceBindings, tableColumns = [] } = targetNode.item;
  const dataElements = useStrictInstanceData().data.filter((d) => d.dataType === dataType) ?? [];
  const mobileView = useIsMobileOrTablet();
  const pdfModeActive = usePdfModeActive();

  return (
    <>
      <Label
        id={`subform-summary2-${id}`}
        renderLabelAs='span'
        weight='regular'
        textResourceBindings={{ title: textResourceBindings?.title }}
      />
      {dataElements.length === 0 ? (
        <div className={classes.emptyField}>
          <Lang id={'general.empty_summary'} />
        </div>
      ) : (
        <table
          className={!mobileView ? classes.table : classes.tableMobile}
          data-testid={`subform-summary-${id}-table`}
        >
          <thead>
            <tr className={pdfModeActive ? classes.grayUnderline : classes.blueUnderline}>
              {tableColumns.length ? (
                tableColumns.map((entry, index) => (
                  <th
                    className={classes.tableCellFormatting}
                    key={index}
                  >
                    <Lang id={entry.headerContent} />
                  </th>
                ))
              ) : (
                <th>
                  <Lang id={'form_filler.sub_form_default_header'} />
                </th>
              )}
              {!pdfModeActive && (
                <th>
                  <p className='sr-only'>
                    <Lang id={'general.edit'} />
                  </p>
                </th>
              )}
            </tr>
          </thead>
          <tbody className={classes.tableBody}>
            {dataElements.map((dataElement, index) => (
              <SubFormSummaryTableRow
                key={dataElement.id}
                dataElement={dataElement}
                node={targetNode}
                rowNumber={index}
                pdfModeActive={pdfModeActive}
              />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function SubFormSummaryTableRow({
  dataElement,
  node,
  rowNumber,
  pdfModeActive,
}: {
  dataElement: IData;
  node: LayoutNode<'SubForm'>;
  rowNumber: number;
  pdfModeActive: boolean;
}) {
  const id = dataElement.id;
  const { tableColumns = [] } = node.item;
  const navigate = useNavigate();
  const instance = useStrictInstanceData();
  const url = getDataModelUrl(instance.id, id, true);
  const { isFetching, data } = useFormDataQuery(url);
  const { langAsString } = useLanguage();
  const rowkey = `subform-summary-cell-${id}`;

  if (isFetching) {
    return (
      <tr className={classes.noRowSpacing}>
        <td colSpan={tableColumns.length}>
          <Spinner
            title={langAsString('general.loading')}
            size='xs'
            key={rowkey}
          />
        </td>
      </tr>
    );
  }

  return (
    <tr
      key={`subform-summary-row-${id}`}
      data-row-num={rowNumber}
      className={classes.noRowSpacing}
    >
      {tableColumns.length ? (
        tableColumns.map((entry, index) => (
          <td key={`${rowkey}-${index}`}>
            {dataQueryWithDefaultValue({
              data,
              languageProvider: { langAsString },
              query: entry.cellContent.query,
              defaultValue: entry.cellContent.default,
            })}
          </td>
        ))
      ) : (
        <Table.Cell key={`${rowkey}-0`}>{String(id)}</Table.Cell>
      )}
      {!pdfModeActive && (
        <td>
          <EditButton
            className={classes.marginLeftAuto}
            componentNode={node}
            summaryComponentId={''}
            navigationOverride={() => navigate(`${node.item.id}/${id}`)}
          />
        </td>
      )}
    </tr>
  );
}
