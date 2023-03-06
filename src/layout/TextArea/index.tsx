import React from 'react';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { FormComponent } from 'src/layout/LayoutComponent';
import { TextAreaComponent } from 'src/layout/TextArea/TextAreaComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class TextArea extends FormComponent<'TextArea'> {
  render(props: PropsFromGenericComponent<'TextArea'>): JSX.Element | null {
    return <TextAreaComponent {...props} />;
  }

  useDisplayData(node: LayoutNodeFromType<'TextArea'>): string {
    const formData = useAppSelector((state) => state.formData.formData);
    if (!node.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    return formData[node.item.dataModelBindings.simpleBinding] || '';
  }

  renderSummary(_props: SummaryRendererProps<'TextArea'>): JSX.Element | null {
    // PRIORITY: Implement
    return <span>Nothing implemented yet</span>;
  }
}
