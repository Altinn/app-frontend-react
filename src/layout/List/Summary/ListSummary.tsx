import React from 'react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export function SummaryListGroup(props: SummaryRendererProps<'List'>) {
  const { onChangeClick, changeText, targetNode } = props;
  const { textResourceBindings: trb, dataModelBindings, tableHeaders } = useNodeItem(targetNode);
  const { formData } = useDataModelBindings(dataModelBindings, 1, 'raw');

  const { langAsString } = useLanguage(targetNode);
  const summaryAccessibleTitleTrb = trb && 'summaryAccessibleTitle' in trb ? trb.summaryAccessibleTitle : undefined;
  const summaryTitleTrb = trb && 'summaryTitle' in trb ? trb.summaryTitle : undefined;
  const titleTrb = trb && 'title' in trb ? trb.title : undefined;
  const ariaLabel = langAsString(summaryTitleTrb ?? summaryAccessibleTitleTrb ?? titleTrb);

  const displayRows: unknown[] = [];
  // @ts-expect-error Please replace with typechecking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData?.saveToList?.forEach((row: any) => {
    const { altinnRowId, ...rest } = row;
    displayRows.push(rest);
  });

  return (
    <div style={{ width: '100%' }}>
      {/* <div className={classes.container}>
        <span className={classes.label}>
          <Lang
            id={summaryTitleTrb ?? titleTrb}
            node={targetNode}
          />
        </span>
        <EditButton
          onClick={onChangeClick}
          editText={changeText}
          label={ariaLabel}
        />
      </div> */}
      <div style={{ width: '100%' }}>
        {displayRows.map((row, rowIndex) => {
          const rowItem = row as { array: unknown[] };
          return (
            <div
              key={rowIndex}
              style={{ border: '2px solid #efefef', margin: '12px 0', padding: '12px' }}
            >
              {Object.entries(tableHeaders).map(([key, value]) => (
                <div key={key}>
                  <span>
                    <Lang id={value} />
                  </span>
                  <span>{rowItem[key]}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
