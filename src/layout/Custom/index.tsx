import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { CustomDef } from 'src/layout/Custom/config.def.generated';
import { CustomWebComponent } from 'src/layout/Custom/CustomWebComponent';
import { SummaryItemSimple } from 'src/layout/Summary/SummaryItemSimple';
import type { DisplayDataProps } from 'src/features/displayData';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompInternal } from 'src/layout/layout';
import type { ExprResolver, StoreFactoryProps, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Custom extends CustomDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Custom'>>(
    function LayoutComponentCustomRender(props, _): JSX.Element | null {
      return <CustomWebComponent {...props} />;
    },
  );

  storeFactory(props: StoreFactoryProps<'Custom'>) {
    return this.defaultStoreFactory(props);
  }

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'Custom'>) {
    return {
      ...item,
      ...evalCommon(),
      ...evalTrb(),
    };
  }

  getDisplayData(
    node: LayoutNode<'Custom'>,
    _item: CompInternal<'Custom'>,
    { formDataSelector }: DisplayDataProps,
  ): string {
    const data = node.getFormData(formDataSelector);
    return Object.values(data).join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Custom'>): JSX.Element | null {
    const displayData = this.useDisplayData(targetNode);
    return <SummaryItemSimple formDataAsString={displayData} />;
  }

  validateDataModelBindings(): string[] {
    return [];
  }
}
