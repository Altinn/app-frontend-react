import React from 'react';

import { CustomWebComponent } from 'src/layout/Custom/CustomWebComponent';
import { LayoutComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Custom extends LayoutComponent<'Custom'> {
  public render(props: PropsFromGenericComponent<'Custom'>): JSX.Element | null {
    return <CustomWebComponent {...props} />;
  }
}
