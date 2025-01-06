import React from 'react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/layout/RepeatingGroup/Summary/SummaryRepeatingGroup.module.css';
import { EditButton } from 'src/layout/Summary/EditButton';
import { SummaryItemCompact } from 'src/layout/Summary/SummaryItemCompact';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { typedBoolean } from 'src/utils/typing';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { RepGroupRow, RepGroupRows } from 'src/layout/RepeatingGroup/types';

interface FullProps extends SummaryRendererProps<'List'> {
  rows: RepGroupRows;
}

interface FullRowProps extends Omit<FullProps, 'rows'> {
  row: RepGroupRow;
}

export function SummaryListGroup(props: SummaryRendererProps<'List'>) {
  const { dataModelBindings } = useNodeItem(props.targetNode);
  const { formData } = useDataModelBindings(dataModelBindings, 1, 'raw');

  const rows: RepGroupRow[] = [];
  // @ts-expect-error Please replace with typechecking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData?.saveToList?.forEach((row: any) => {
    const { altinnRowId, ...rest } = row;
    rows.push(rest);
  });

  return (
    <RegularRepeatingGroup
      {...props}
      rows={rows}
    />
  );
}

function RegularRepeatingGroup(props: FullProps) {
  const { onChangeClick, changeText, targetNode, rows: _rows } = props;
  const rows = _rows.filter(typedBoolean);

  const { textResourceBindings: trb } = useNodeItem(targetNode);
  const { langAsString } = useLanguage(targetNode);

  const summaryAccessibleTitleTrb = trb && 'summaryAccessibleTitle' in trb ? trb.summaryAccessibleTitle : undefined;
  const summaryTitleTrb = trb && 'summaryTitle' in trb ? trb.summaryTitle : undefined;
  const titleTrb = trb && 'title' in trb ? trb.title : undefined;
  const ariaLabel = langAsString(summaryTitleTrb ?? summaryAccessibleTitleTrb ?? titleTrb);

  return (
    <>
      <div style={{ width: '100%' }}>
        <div className={classes.container}>
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
        </div>
        <div style={{ width: '100%' }}>
          {rows.map((row) => (
            <RegularRepeatingGroupRow
              key={`row-${row.uuid}`}
              {...props}
              row={row}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function RegularRepeatingGroupRow({ targetNode, row }: FullRowProps) {
  const displayData = this.useDisplayData(targetNode);
  return (
    <div
      data-testid={'summary-repeating-row'}
      key={`row-${row.uuid}`}
      className={classes.border}
    >
      <SummaryItemCompact
        targetNode={targetNode}
        displayData={displayData}
      />
    </div>
  );
}
