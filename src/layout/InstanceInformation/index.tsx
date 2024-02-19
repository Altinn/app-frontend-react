import React, { forwardRef } from 'react';

import { InstanceInformationDef } from 'src/layout/InstanceInformation/config.def.generated';
import { InstanceInformationComponent } from 'src/layout/InstanceInformation/InstanceInformationComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class InstanceInformation extends InstanceInformationDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'InstanceInformation'>>((props, _): JSX.Element | null => (
    <InstanceInformationComponent {...props} />
  ));
}
