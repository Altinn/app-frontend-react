import React from 'react';

import { FD } from 'src/features/formData2/Compatibility';
import { useLanguage } from 'src/hooks/useLanguage';
import { DatepickerComponent } from 'src/layout/Datepicker/DatepickerComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { getDateFormat } from 'src/utils/dateHelpers';
import { formatISOString } from 'src/utils/formatDate';
import type { ExprResolved } from 'src/features/expressions/types';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutCompDatepicker } from 'src/layout/Datepicker/types';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Datepicker extends FormComponent<'Datepicker'> {
  render(props: PropsFromGenericComponent<'Datepicker'>): JSX.Element | null {
    return <DatepickerComponent {...props} />;
  }

  useDisplayData(node: LayoutNodeFromType<'Datepicker'>): string {
    const data = FD.usePick(node.item.dataModelBindings?.simpleBinding) ?? '';
    const { selectedLanguage } = useLanguage();
    if (typeof data !== 'string') {
      return '';
    }

    const dateFormat = getDateFormat(node.item.format, selectedLanguage);
    return formatISOString(data, dateFormat) ?? '';
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Datepicker'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return (
      <SummaryItemSimple
        formDataAsString={displayData}
        hideFromVisualTesting={true}
      />
    );
  }
}

export const Config = {
  def: new Datepicker(),
};

export type TypeConfig = {
  layout: ILayoutCompDatepicker;
  nodeItem: ExprResolved<ILayoutCompDatepicker>;
  nodeObj: LayoutNode;
};
