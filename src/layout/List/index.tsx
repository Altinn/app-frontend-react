import React from 'react';

import { LayoutComponent } from 'src/layout/LayoutComponent';
import { ListComponent } from 'src/layout/List/ListComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class List extends LayoutComponent<'List'> {
  public render(props: PropsFromGenericComponent<'List'>): JSX.Element | null {
    return <ListComponent {...props} />;
  }
}
