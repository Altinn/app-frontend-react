import React, { forwardRef } from 'react';

import { ParagraphDef } from 'src/layout/Paragraph/config.def.generated';
import { ParagraphComponent } from 'src/layout/Paragraph/ParagraphComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ExprResolver, StoreFactoryProps } from 'src/layout/LayoutComponent';

export class Paragraph extends ParagraphDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Paragraph'>>(
    function LayoutComponentParagraphRender(props, _): JSX.Element | null {
      return <ParagraphComponent {...props} />;
    },
  );

  storeFactory(props: StoreFactoryProps<'Paragraph'>) {
    return this.defaultStoreFactory(props);
  }

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'Paragraph'>) {
    return {
      ...item,
      ...evalCommon(),
      ...evalTrb(),
    };
  }
}
