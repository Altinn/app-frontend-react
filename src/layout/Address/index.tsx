import React from 'react';

import { AddressComponent } from 'src/layout/Address/AddressComponent';
import { FormComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Address extends FormComponent<'AddressComponent'> {
  render(props: PropsFromGenericComponent<'AddressComponent'>): JSX.Element | null {
    return <AddressComponent {...props} />;
  }

  renderWithLabel(): boolean {
    return false;
  }
}
