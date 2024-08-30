import React from 'react';

import { Spinner } from '@digdir/designsystemet-react';

import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useStrictInstanceData } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { DataQueryWithDefaultValue } from 'src/layout/SubForm/SubFormComponent';
import classes from 'src/layout/SubForm/Summary/SubFormSummaryComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { getDataModelUrl } from 'src/utils/urls/appUrlHelper';
import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ISubFormSummaryComponent {
  targetNode: LayoutNode<'SubForm'>;
}

export function SubFormSummaryComponent({ targetNode }: ISubFormSummaryComponent): React.JSX.Element | null {
  const { dataType, id } = useNodeItem(targetNode);
  const dataElements = useStrictInstanceData().data.filter((d) => d.dataType === dataType) ?? [];

  return (
    <div
      className={classes.container}
      data-testid={`subform-summary-${id}`}
    >
      {dataElements.length === 0 ? (
        <div className={classes.emptyField}>
          <Lang id={'general.empty_summary'} />
        </div>
      ) : (
        dataElements.map((dataElement) => (
          <SubFormSummaryRow
            key={dataElement.id}
            dataElement={dataElement}
            node={targetNode}
          />
        ))
      )}
    </div>
  );
}

function SubFormSummaryRow({ dataElement, node }: { dataElement: IData; node: LayoutNode<'SubForm'> }) {
  const id = dataElement.id;
  const { tableColumns = [], summaryDelimiter = ' — ' } = useNodeItem(node);
  const instance = useStrictInstanceData();
  const url = getDataModelUrl(instance.id, id, true);
  const { isFetching, data, error, failureCount } = useFormDataQuery(url);
  const { langAsString } = useLanguage();
  const rowkey = `subform-summary-${node.id}-${id}`;

  if (isFetching) {
    return (
      <Spinner
        title={langAsString('general.loading')}
        size='xs'
        key={rowkey}
      />
    );
  } else if (error) {
    console.error(`Error loading data element ${id} from server. Gave up after ${failureCount} attempt(s).`, error);
    return <Lang id='form_filler.error_fetch_subform' />;
  }

  const content = tableColumns.map((entry, i) => (
    <DataQueryWithDefaultValue
      key={i}
      data={data}
      query={entry.cellContent.query}
      defaultValue={entry.cellContent.default}
    />
  ));

  if (content.length === 0) {
    content.push(<>{id}</>);
  }

  const isLastEntry = (i: number) => i === content.length - 1;

  return (
    <div
      className={classes.row}
      key={rowkey}
    >
      <div key={id}>
        {content.map((entry, i) => (
          <>
            {entry}
            {!isLastEntry(i) && <span>{summaryDelimiter}</span>}
          </>
        ))}
      </div>
    </div>
  );
}
