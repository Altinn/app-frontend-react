import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { useFileUploaderDataBindingsValidation } from 'src/layout/FileUpload/utils/useFileUploaderDataBindingsValidation';
import { ImageUploadDef } from 'src/layout/ImageUpload/config.def.generated';
import { ImageUploadComponent } from 'src/layout/ImageUpload/ImageUploadComponent';
import type { LayoutLookups } from 'src/features/form/layout/makeLayoutLookups';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IDataModelBindings } from 'src/layout/layout';
import type { ExprResolver, SummaryRendererProps } from 'src/layout/LayoutComponent';

export class ImageUpload extends ImageUploadDef {
  useDisplayData(): string {
    return '';
  }

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'ImageUpload'>>(
    function LayoutComponentTextRender(props, _): JSX.Element | null {
      return <ImageUploadComponent {...props} />;
    },
  );

  isDataModelBindingsRequired(baseComponentId: string, layoutLookups: LayoutLookups): boolean {
    // Data model bindings are only required when the component is defined inside a repeating group
    const parentId = layoutLookups.componentToParent[baseComponentId];
    const parentLayout = parentId && parentId.type === 'node' ? layoutLookups.allComponents[parentId.id] : undefined;
    return parentLayout?.type === 'RepeatingGroup';
  }

  useDataModelBindingValidation(baseComponentId: string, bindings: IDataModelBindings<'ImageUpload'>): string[] {
    return useFileUploaderDataBindingsValidation(baseComponentId, bindings);
  }

  renderSummary(_props: SummaryRendererProps): JSX.Element | null {
    throw new Error('Method not implemented.'); // TODO
  }

  renderSummary2(): JSX.Element | null {
    return <div>test</div>;
  }

  evalExpressions(props: ExprResolver<'ImageUpload'>) {
    return {
      ...this.evalDefaultExpressions(props),
    };
  }
}
