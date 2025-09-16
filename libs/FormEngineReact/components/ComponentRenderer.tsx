import React from 'react';

import { useComponentMap } from 'libs/FormEngineReact/FormEngineProvider';
import { useComponentData, useComponentValidation, useComponentVisibility } from 'libs/FormEngineReact/hooks';
import type { BaseComponent } from 'libs/FormEngine/types';

export interface ComponentRendererProps {
  component: BaseComponent;
  parentBinding?: string;
  itemIndex?: number;
  renderAsSummary?: boolean;
}

/**
 * Dynamic component renderer that uses FormEngine component registry
 * This is the core rendering logic for all components in FormEngineReact
 */
export function ComponentRenderer({
  component,
  parentBinding,
  itemIndex,
  renderAsSummary: _renderAsSummary = false,
}: ComponentRendererProps) {
  // Note: renderAsSummary is currently not implemented but kept for future use
  // Use FormEngine hooks for component state
  const { value, updateValue } = useComponentData(component, parentBinding, itemIndex);
  const { errors, isValid } = useComponentValidation(component, parentBinding, itemIndex);
  const isVisible = useComponentVisibility(component.id);

  // Get component registry from React context
  const componentMap = useComponentMap();

  // Return null if component is not visible
  if (!isVisible) {
    return null;
  }

  // Get the registered component from the map
  const Component = componentMap[component.type];

  if (!Component) {
    return (
      <div
        style={{
          padding: '8px',
          border: '1px solid #ff6b6b',
          borderRadius: '4px',
          background: '#ffe0e0',
        }}
      >
        Component type "{component.type}" not found in registry
      </div>
    );
  }

  // Create component props
  const componentProps = {
    // Core FormEngine context
    formEngine: {
      value,
      updateValue,
      errors,
      isValid,
      isVisible,
      config: component,
      id: component.id,
      type: component.type,
      parentBinding,
      itemIndex,
    },

    // Additional props that might be needed by legacy components
    component,
    parentBinding,
    itemIndex,
  };

  try {
    return <Component {...componentProps} />;
  } catch (error) {
    console.error(`Error rendering component ${component.type}:`, error);
    return (
      <div
        style={{
          padding: '8px',
          border: '1px solid #ff6b6b',
          borderRadius: '4px',
          background: '#ffe0e0',
        }}
      >
        Error rendering component "{component.type}": {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }
}
