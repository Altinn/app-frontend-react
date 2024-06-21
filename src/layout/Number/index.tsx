import React, { forwardRef } from 'react';

import { NumberDef } from 'src/layout/Number/config.def.generated';
import { NumberComponent } from 'src/layout/Number/NumberComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Number extends NumberDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Number'>>(
    function LayoutComponentParagraphRender(props, _): JSX.Element | null {
      return <NumberComponent {...props} />;
    },
  );
}
