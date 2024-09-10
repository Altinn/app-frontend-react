import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Spinner, Table } from '@digdir/designsystemet-react';

import { Label } from 'src/components/label/Label';
import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useStrictInstanceData } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { usePdfModeActive } from 'src/features/pdf/PDFWrapper';
import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import { DataQueryWithDefaultValue } from 'src/layout/Subform/SubformComponent';
import classes from 'src/layout/Subform/Summary/SubformSummaryComponent2.module.css';
import { EditButton } from 'src/layout/Summary2/CommonSummaryComponents/EditButton';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { getStatefulDataModelUrl } from 'src/utils/urls/appUrlHelper';
import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ISubformSummaryComponent {
  targetNode: LayoutNode<'Subform'>;
}

export function SubformSummaryComponent2({ targetNode }: ISubformSummaryComponent): React.JSX.Element | null {
  const { layoutSet, id, textResourceBindings, tableColumns = [] } = useNodeItem(targetNode);
  const dataType = useDataTypeFromLayoutSet(layoutSet);
  const dataElements = useStrictInstanceData().data.filter((d) => d.dataType === dataType) ?? [];
  const mobileView = useIsMobileOrTablet();
  const pdfModeActive = usePdfModeActive();

  return (
    <>
      <Label
        node={targetNode}
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
                  <th key={index}>
                    <Lang id={entry.headerContent} />
                  </th>
                ))
              ) : (
                <th>
                  <Lang id={'form_filler.subform_default_header'} />
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
              <SubformSummaryTableRow
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

function SubformSummaryTableRow({
  dataElement,
  node,
  rowNumber,
  pdfModeActive,
}: {
  dataElement: IData;
  node: LayoutNode<'Subform'>;
  rowNumber: number;
  pdfModeActive: boolean;
}) {
  const id = dataElement.id;
  const { tableColumns = [] } = useNodeItem(node);
  const navigate = useNavigate();
  const instance = useStrictInstanceData();
  const url = getStatefulDataModelUrl(instance.id, id, true);
  const { isFetching, data, error, failureCount } = useFormDataQuery(url);
  const { langAsString } = useLanguage();

  if (isFetching) {
    return (
      <tr className={classes.noRowSpacing}>
        <td colSpan={tableColumns.length}>
          <Spinner
            title={langAsString('general.loading')}
            size='xs'
          />
        </td>
      </tr>
    );
  } else if (error) {
    console.error(`Error loading data element ${id} from server. Gave up after ${failureCount} attempt(s).`, error);
    return (
      <tr className={classes.noRowSpacing}>
        <td colSpan={tableColumns.length}>
          <Lang id='form_filler.error_fetch_subform' />
        </td>
      </tr>
    );
  }

  return (
    <tr
      data-row-num={rowNumber}
      className={classes.noRowSpacing}
    >
      {tableColumns.length ? (
        tableColumns.map((entry, i) => (
          <td key={i}>
            <DataQueryWithDefaultValue
              key={i}
              data={data}
              query={entry.cellContent.query}
              defaultValue={entry.cellContent.default}
            />
          </td>
        ))
      ) : (
        <Table.Cell>{String(id)}</Table.Cell>
      )}
      {!pdfModeActive && (
        <td>
          <EditButton
            className={classes.marginLeftAuto}
            componentNode={node}
            summaryComponentId={''}
            navigationOverride={() => navigate(`${node.id}/${id}`)}
          />
        </td>
      )}
    </tr>
  );
}