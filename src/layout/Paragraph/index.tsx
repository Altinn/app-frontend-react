import React, { forwardRef } from 'react';

import { ParagraphDef } from 'src/layout/Paragraph/config.def.generated';
import { ParagraphComponent } from 'src/layout/Paragraph/ParagraphComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Paragraph extends ParagraphDef {
  // eslint-disable-next-line react/display-name
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Paragraph'>>((props, _): JSX.Element | null => (
    <ParagraphComponent {...props} />
  ));
}
