import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { ActionButtonDef } from 'src/layout/ActionButton/config.def.generated';
import { PDFPreviewButtonComponent } from 'src/layout/PDFPreviewButton/PDFPreviewButtonComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class ActionButton extends ActionButtonDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'ActionButton'>>(
    function LayoutComponentActionButtonRender(props, _): JSX.Element | null {
      return <PDFPreviewButtonComponent {...props} />;
    },
  );
}
