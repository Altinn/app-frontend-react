import React from 'react';

import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import { TextAreaDef } from 'src/layout/TextArea/config.generated';
import { TextAreaComponent } from 'src/layout/TextArea/TextAreaComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class TextArea extends TextAreaDef {
  render(props: PropsFromGenericComponent<'TextArea'>): JSX.Element | null {
    return <TextAreaComponent {...props} />;
  }

  getDisplayData(node: LayoutNodeFromType<'TextArea'>, { formData }): string {
    if (!node.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    return formData[node.item.dataModelBindings.simpleBinding] || '';
  }

  renderSummary({ targetNode }: SummaryRendererProps<'TextArea'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }
}
