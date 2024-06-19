import React, { forwardRef } from 'react';

import { TextDef } from 'src/layout/Text/config.def.generated';
import { TextComponent } from 'src/layout/Text/TextComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Text extends TextDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Text'>>(
    function LayoutComponentParagraphRender(props, _): JSX.Element | null {
      return <TextComponent {...props} />;
    },
  );
}
