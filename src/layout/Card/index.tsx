import React, { forwardRef } from 'react';

import { Card as CardComponent } from 'src/layout/Card/Card';
import { CardDef } from 'src/layout/Card/config.def.generated';
import type { PropsFromGenericComponent } from 'src/layout';

export class Card extends CardDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Card'>>(
    function LayoutComponentCardRender(props, _): React.JSX.Element | null {
      return <CardComponent {...props} />;
    },
  );
}
