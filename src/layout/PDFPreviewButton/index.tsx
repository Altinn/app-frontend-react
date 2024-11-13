import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { PDFPreviewButtonDef } from 'src/layout/PDFPreviewButton/config.def.generated';
import { PDFPreviewButtonComponent } from 'src/layout/PDFPreviewButton/PDFPreviewButtonComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class PDFPreviewButton extends PDFPreviewButtonDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'PDFPreviewButton'>>(
    function LayoutComponentActionButtonRender(props, _): JSX.Element | null {
      return <PDFPreviewButtonComponent {...props} />;
    },
  );
}
