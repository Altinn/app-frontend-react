import React from 'react';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { DropdownComponent } from 'src/layout/Dropdown/DropdownComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import { useSelectedValueToText } from 'src/utils/formComponentUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class Dropdown extends FormComponent<'Dropdown'> {
  render(props: PropsFromGenericComponent<'Dropdown'>): JSX.Element | null {
    return <DropdownComponent {...props} />;
  }

  useDisplayData(node: LayoutNodeFromType<'Dropdown'>): string {
    const formData = useAppSelector((state) => state.formData.formData);
    if (!node.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const value = formData[node.item.dataModelBindings.simpleBinding] || '';
    return useSelectedValueToText(node.item, value) || '';
  }

  renderSummary(_props: SummaryRendererProps<'Dropdown'>): JSX.Element | null {
    // PRIORITY: Implement
    return <span>Not implemented</span>;
  }
}
