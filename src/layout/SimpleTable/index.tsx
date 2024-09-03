import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { SimpleTableDef } from 'src/layout/SimpleTable/config.def.generated';
import { SimpleTableComponent } from 'src/layout/SimpleTable/SimpleTableComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class SimpleTable extends SimpleTableDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'SimpleTable'>>(
    function LayoutComponentSimpleTableRender(props, _): JSX.Element | null {
      return <SimpleTableComponent {...props} />;
    },
  );
}
