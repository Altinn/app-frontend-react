import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { ImageUploadDef } from 'src/layout/ImageUpload/config.def.generated';
import { ImageUploadComponent } from 'src/layout/ImageUpload/ImageUploadComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';

export class ImageUpload extends ImageUploadDef {
  useDisplayData(): string {
    return '';
  }

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'ImageUpload'>>(
    function LayoutComponentTextRender(props, _): JSX.Element | null {
      return <ImageUploadComponent {...props} />;
    },
  );

  renderSummary2(): JSX.Element | null {
    return <div>test</div>;
  }

  evalExpressions(props: ExprResolver<'ImageUpload'>) {
    return {
      ...this.evalDefaultExpressions(props),
    };
  }
}
