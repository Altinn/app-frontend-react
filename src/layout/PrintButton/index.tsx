import React, { forwardRef } from 'react';

import type { PropsFromGenericComponent } from '..';

import { PrintButtonDef } from 'src/layout/PrintButton/config.def.generated';
import { PrintButtonComponent } from 'src/layout/PrintButton/PrintButtonComponent';

export class PrintButton extends PrintButtonDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'PrintButton'>>((props, _): JSX.Element | null => (
    <PrintButtonComponent {...props} />
  ));
}
