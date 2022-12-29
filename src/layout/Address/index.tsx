import React from 'react';

import { AddressComponent } from 'src/layout/Address/AddressComponent';
import { LayoutComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Address extends LayoutComponent<'AddressComponent'> {
  public render(props: PropsFromGenericComponent<'AddressComponent'>): JSX.Element | null {
    return <AddressComponent {...props} />;
  }
}
