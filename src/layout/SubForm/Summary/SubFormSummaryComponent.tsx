import React from 'react';

import { Spinner } from '@digdir/designsystemet-react';

import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useStrictInstanceData } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { dataQueryWithDefaultValue } from 'src/layout/SubForm/SubFormComponent';
import classes from 'src/layout/SubForm/Summary/SubFormSummaryComponent.module.css';
import { getDataModelUrl } from 'src/utils/urls/appUrlHelper';
import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ISubFormSummaryComponent {
  targetNode: LayoutNode<'SubForm'>;
}

export function SubFormSummaryComponent({ targetNode }: ISubFormSummaryComponent): React.JSX.Element | null {
  const { dataType, id } = targetNode.item;
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
  const { tableColumns = [], summaryDelimiter = ' — ' } = node.item;
  const instance = useStrictInstanceData();
  const url = getDataModelUrl(instance.id, id, true);
  const { isFetching, data } = useFormDataQuery(url);
  const { langAsString } = useLanguage();
  const rowkey = `subform-summary-${node.item.id}-${id}`;

  if (isFetching) {
    return (
      <Spinner
        title={langAsString('general.loading')}
        size='xs'
        key={rowkey}
      />
    );
  }

  const content = tableColumns.map((entry) =>
    dataQueryWithDefaultValue({
      data,
      languageProvider: { langAsString },
      query: entry.cellContent.query,
      defaultValue: entry.cellContent.default,
    }),
  );
  if (content.length === 0) {
    content.push(id);
  }

  return (
    <div
      className={classes.row}
      key={rowkey}
    >
      <div key={id}>{content.join(summaryDelimiter)}</div>
    </div>
  );
}
