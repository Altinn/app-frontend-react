import React from 'react';

import { CustomWebComponent } from 'src/layout/Custom/CustomWebComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Custom extends FormComponent<'Custom'> {
  render(props: PropsFromGenericComponent<'Custom'>): JSX.Element | null {
    return <CustomWebComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }
}
