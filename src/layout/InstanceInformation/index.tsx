import React from 'react';

import { InstanceInformationComponent } from 'src/layout/InstanceInformation/InstanceInformationComponent';
import { LayoutComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class InstanceInformation extends LayoutComponent<'InstanceInformation'> {
  public render(props: PropsFromGenericComponent<'InstanceInformation'>): JSX.Element | null {
    return <InstanceInformationComponent {...props} />;
  }
}
