import React, { forwardRef } from 'react';

import type { PropsFromGenericComponent } from '..';

import { LinkDef } from 'src/layout/Link/config.def.generated';
import { LinkComponent } from 'src/layout/Link/LinkComponent';

export class Link extends LinkDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Link'>>((props, _): JSX.Element | null => (
    <LinkComponent {...props} />
  ));
}
