import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { GeometryMapDef } from 'src/layout/GeometryMap/config.def.generated';
import { GeometryMapComponent } from 'src/layout/GeometryMap/GeometryMapComponent';
// import { GeometryMapComponentSummary } from 'src/layout/GeometryMap/GeometryMapComponentSummary';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class GeometryMap extends GeometryMapDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'GeometryMap'>>(
    function LayoutComponentMapRender(props, _): JSX.Element | null {
      return <GeometryMapComponent {...props} />;
    },
  );

  getDisplayData(node: LayoutNode<'GeometryMap'>, { formDataSelector }: DisplayDataProps): string {
    if (!node.item.dataModelBindings?.coordinates) {
      return '';
    }

    return node.getFormData(formDataSelector).coordinates ?? '';
  }

  renderSummary({ targetNode }: SummaryRendererProps<'GeometryMap'>): JSX.Element | null {
    return null;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'GeometryMap'>): string[] {
    const errors: string[] = [
      ...(this.validateDataModelBindingsAny(ctx, 'coordinates', ['string'])[0] || []),
      ...(this.validateDataModelBindingsAny(ctx, 'label', ['string'])[0] || []),
    ];

    return errors;
  }
}
