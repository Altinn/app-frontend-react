import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { MapDef } from 'src/layout/Map/config.def.generated';
import { MapComponent } from 'src/layout/Map/MapComponent';
import { MapComponentSummary } from 'src/layout/Map/MapComponentSummary';
import { parseLocation } from 'src/layout/Map/utils';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { DisplayDataProps } from 'src/features/displayData';
import type { FormDataSelector, PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Location } from 'src/layout/Map/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Map extends MapDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Map'>>(
    function LayoutComponentMapRender(props, _): JSX.Element | null {
      return <MapComponent {...props} />;
    },
  );

  getDisplayData(node: LayoutNode<'Map'>, { formDataSelector }: DisplayDataProps): string {
    const location = this.getMarkerLocation(node, formDataSelector);
    return location ? `${location.latitude}, ${location.longitude}` : '';
  }

  getMarkerLocation(node: LayoutNode<'Map'>, formDataSelector: FormDataSelector): Location | undefined {
    if (!node.item.dataModelBindings?.simpleBinding) {
      return undefined;
    }

    return parseLocation(node.getFormData(formDataSelector).simpleBinding);
  }

  renderSummary({ targetNode }: SummaryRendererProps<'Map'>): JSX.Element | null {
    return <MapComponentSummary targetNode={targetNode} />;
  }

  validateDataModelBindings(ctx: LayoutValidationCtx<'Map'>): string[] {
    return this.validateDataModelBindingsSimple(ctx);
  }
}
