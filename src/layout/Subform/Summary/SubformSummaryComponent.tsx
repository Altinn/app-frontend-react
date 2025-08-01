import React from 'react';
import type { ReactNode } from 'react';

import { Spinner } from '@digdir/designsystemet-react';

import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
import { useStrictDataElements } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { SubformCellContent } from 'src/layout/Subform/SubformCellContent';
import classes from 'src/layout/Subform/Summary/SubformSummaryComponent.module.css';
import { useExpressionDataSourcesForSubform, useSubformFormData } from 'src/layout/Subform/utils';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { IData } from 'src/types/shared';

export function SubformSummaryComponent({ targetBaseComponentId }: SummaryRendererProps): React.JSX.Element | null {
  const { layoutSet, id } = useItemWhenType(targetBaseComponentId, 'Subform');
  const dataType = useDataTypeFromLayoutSet(layoutSet);
  const dataElements = useStrictDataElements(dataType);

  return (
    <div
      className={classes.container}
      data-testid={`subform-summary-${id}`}
    >
      {dataElements.length === 0 ? (
        <div className={classes.emptyField}>
          <Lang id='general.empty_summary' />
        </div>
      ) : (
        dataElements.map((dataElement) => (
          <SubformSummaryRow
            key={dataElement.id}
            dataElement={dataElement}
            baseComponentId={targetBaseComponentId}
          />
        ))
      )}
    </div>
  );
}

function SubformSummaryRow({ dataElement, baseComponentId }: { dataElement: IData; baseComponentId: string }) {
  const id = dataElement.id;
  const { tableColumns, summaryDelimiter = ' — ' } = useItemWhenType(baseComponentId, 'Subform');

  const { isSubformDataFetching, subformData, subformDataError } = useSubformFormData(dataElement.id);
  const subformDataSources = useExpressionDataSourcesForSubform(dataElement.dataType, subformData, tableColumns);

  const { langAsString } = useLanguage();

  if (isSubformDataFetching) {
    return (
      <Spinner
        aria-label={langAsString('general.loading')}
        data-size='xs'
      />
    );
  } else if (subformDataError) {
    return <Lang id='form_filler.error_fetch_subform' />;
  }

  const content: (ReactNode | string)[] = tableColumns.map((entry, i) => (
    <SubformCellContent
      key={i}
      cellContent={entry.cellContent}
      baseComponentId={baseComponentId}
      data={subformData}
      dataSources={subformDataSources}
    />
  ));

  if (content.length === 0) {
    content.push(id);
  }

  const isLastEntry = (i: number) => i === content.length - 1;

  return (
    <div className={classes.row}>
      <div>
        {content.map((entry, i) => (
          <React.Fragment key={`wrapper-${i}`}>
            {entry}
            {!isLastEntry(i) && <span key={`delimiter-${i}`}>{summaryDelimiter}</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
