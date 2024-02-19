import React, { forwardRef } from 'react';

import { Alert as AlertComponent } from 'src/layout/Alert/Alert';
import { AlertDef } from 'src/layout/Alert/config.def.generated';
import type { PropsFromGenericComponent } from 'src/layout';

export class Alert extends AlertDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Alert'>>((props, _): JSX.Element | null => (
    <AlertComponent {...props} />
  ));
}
