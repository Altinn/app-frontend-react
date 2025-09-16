import React, { memo } from 'react';

import { ComponentRenderer } from 'libs/FormEngineReact/components';
import type { BaseComponent } from 'libs/FormEngine/types';

export interface RenderComponentType {
  component: BaseComponent;
  parentBinding?: string;
  itemIndex?: number;
  childField?: string;
  renderAsSummary?: boolean;
}

export const RenderComponent = memo(function RenderComponentMemo({
  component,
  parentBinding,
  itemIndex,
  childField: _childField, // Note: currently unused but kept for compatibility
  renderAsSummary,
}: RenderComponentType) {
  // Delegate to FormEngineReact's ComponentRenderer as per architecture
  return (
    <ComponentRenderer
      component={component}
      parentBinding={parentBinding}
      itemIndex={itemIndex}
      renderAsSummary={renderAsSummary}
    />
  );
});
