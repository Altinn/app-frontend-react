import React from 'react';
import type { FC, ReactNode } from 'react';

import { Spinner } from '@digdir/designsystemet-react';

import { withReadyState } from 'src/components/ReadyContext';
import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
import { useStrictDataElements } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { SubformCellContent } from 'src/layout/Subform/SubformCellContent';
import classes from 'src/layout/Subform/Summary/SubformSummaryComponent.module.css';
import { useExpressionDataSourcesForSubform, useSubformFormData } from 'src/layout/Subform/utils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ISubformSummaryComponent {
  targetNode: LayoutNode<'Subform'>;
}

export function SubformSummaryComponent({ targetNode }: ISubformSummaryComponent): React.JSX.Element | null {
  const { layoutSet, id } = useNodeItem(targetNode);
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
            node={targetNode}
          />
        ))
      )}
    </div>
  );
}

const SubformSummaryRow: FC<{ dataElement: IData; node: LayoutNode<'Subform'> }> = withReadyState(
  ({ dataElement, node, MarkReady }) => {
    const id = dataElement.id;
    const { tableColumns, summaryDelimiter = ' — ' } = useNodeItem(node);

    const { isSubformDataFetching, subformData, subformDataError } = useSubformFormData(dataElement.id);
    const subformDataSources = useExpressionDataSourcesForSubform(dataElement.dataType, subformData, tableColumns);

    const { langAsString } = useLanguage();

    if (isSubformDataFetching) {
      return (
        <Spinner
          title={langAsString('general.loading')}
          size='xs'
        />
      );
    } else if (subformDataError) {
      return <Lang id='form_filler.error_fetch_subform' />;
    }

    const content: (ReactNode | string)[] = tableColumns.map((entry, i) => (
      <SubformCellContent
        key={i}
        cellContent={entry.cellContent}
        reference={{ type: 'node', id: node.id }}
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
          <MarkReady />
        </div>
      </div>
    );
  },
);
